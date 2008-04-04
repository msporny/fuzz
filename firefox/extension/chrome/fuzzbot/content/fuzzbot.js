/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */

/* Global variables that track the state of this plugin */
var gFuzzbotVisible = true;
var gAvailableTriples = false;
var gTripleStore = {};

/* Constants */
var RDFA_PARSE_WARNING = -2;
var RDFA_PARSE_FAILED = -1;
var RDFA_PARSE_UNKNOWN = 0;
var RDFA_PARSE_SUCCESS = 1;

/**
 * Logs a message to the console.
 *
 * @param msg the message to log to the console.
 */
function _fuzzbotLog(msg)
{
   debug_flag = true;

   // If debug mode is active, log the message to the console
   if(debug_flag)
   {
      Components
         .classes["@mozilla.org/consoleservice;1"]
         .getService(Components.interfaces["nsIConsoleService"])
         .logStringMessage(msg);
  }
}

/**
 * Gets the currently active window.
 */
function getCurrentWindow()
{
   return window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
             .getInterface(Components.interfaces.nsIWebNavigation)
             .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
             .rootTreeItem
             .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
             .getInterface(Components.interfaces.nsIDOMWindow);
}

/**
 * Open a new tab showing the status of the Fuzzbot software.
 */
function showStatus()
{
   mainWindow = getCurrentWindow();
   newTab = mainWindow.getBrowser().addTab(
      "about:");
   mainWindow.getBrowser().selectedTab = newTab;
}

/**
 * Sets a timer to update the interface from time to time to show the person
 * on the current system the status of the Fuzzbot software.
 */
function updateFuzzbotStatus()
{
   //mainWindow = getCurrentWindow();

   window.setTimeout(updateFuzzbotStatus, 1000);
}

/**
 * Updates the Firefox display window with the updated status.
 */
function updateFuzzbotStatusDisplay(triplesFound)
{
   statusImage = document.getElementById("fuzzbot-status-image");
   ui = document.getElementById("fuzzbot-ui");
   
   // update the image and the label
   if(triplesFound)
   {
      statusImage.src = "chrome://fuzzbot/content/fuzzbot16-online.png";
      gFuzzbotVisible = !gFuzzbotVisible;
      ui.hidden = gFuzzbotVisible;
      
      if(ui.hidden)
      {
         removeFuzzbotMarkup();
      }
      else
      {
         addFuzzbotMarkup();
      }
   }
   else
   {
      statusImage.src = "chrome://fuzzbot/content/fuzzbot16-offline.png";
      ui.hidden = true;
      gFuzzbotVisible = false;
   }
}

// This observer is responsible for detecting triples that are
// generated via the C++ XPCOM librdfa parser.
function tripleHandler(subject, predicate, object)
{
   gAvailableTriples = true;
   _fuzzbotLog("Fuzzbot: " + subject + " " + predicate + " " + object + " .");

   // strip any whitespace;
   var strippedObject = object.replace(/\r/g, " ");
   strippedObject = strippedObject.replace(/\n/g, " ");
   strippedObject = strippedObject.replace(/\t/g, " ");
   strippedObject = strippedObject.replace(/ +/g, " ");
   strippedObject = strippedObject.replace(/^ +/g, "");
   
   triple = new Object();
   triple.subject = subject;
   triple.predicate = predicate;
   triple.object = strippedObject;

   if(!gTripleStore[subject])
   {
      gTripleStore[subject] = new Array();
   }
   
   gTripleStore[subject].push(triple);
   _fuzzbotLog("Stored: " + triple.subject + " " + triple.predicate + " " +
               triple.object + " .");
   
   tchildren = document.getElementById("fuzzbot-triple-tree-children");
   
   //_fuzzbotLog(tchildren);

   // create Treerow with id (rowid is a global variable so that
   // we do not use the same id twice)
   var ti = document.createElement("treeitem");
   var tr = document.createElement("treerow");
   var tcs = document.createElement("treecell");
   var tcp = document.createElement("treecell");
   var tco = document.createElement("treecell");
   tcs.setAttribute("label", triple.subject);
   tcp.setAttribute("label", triple.predicate);
   tco.setAttribute("label", triple.object);
   
   tr.appendChild(tcs);
   tr.appendChild(tcp);
   tr.appendChild(tco);
   ti.appendChild(tr);
   
   tchildren.appendChild(ti);
   
   return true;
};

/**
 * Clears the triples that are being shown on the screen.
 */
function clearUiTriples()
{
   // clear the current list of children
   tchildren = document.getElementById("fuzzbot-triple-tree-children");
   while(tchildren.firstChild)
   {
      tchildren.removeChild(tchildren.firstChild);
   }
   
   gTripleStore = {};
}

/**
 * Starts a thread to perform semantic data detection on the page.
 */
function detectSemanticData(obj)
{
   var serializer = new XMLSerializer();
   var url = gBrowser.contentDocument.URL;
   var xml = serializer.serializeToString(gBrowser.contentDocument);

   //_fuzzbotLog(xml);
   
   var gPlugin = Components
      .classes["@rdfa.digitalbazaar.com/fuzzbot/xpcom;1"]
      .getService()
      .QueryInterface(
         Components.interfaces.nsIFuzzbotExtension);
   
   clearUiTriples();

   gAvailableTriples = false;
   var rval = gPlugin.processRdfaTriples(url, xml, tripleHandler);

   // if the previous parse failed, it is usually because the input
   // document is malformed. Instruct Fuzzbot to use Tidy to clean up
   // the incoming HTML/XHTML and retry.
   if(rval != RDFA_PARSE_SUCCESS)
   {
      clearUiTriples();
      gAvailableTriples = false;
      gPlugin.tidyAndProcessRdfaTriples(url, xml, tripleHandler);
   }
   
   updateFuzzbotStatusDisplay(gAvailableTriples);
}
