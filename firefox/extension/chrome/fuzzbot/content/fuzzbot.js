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
   
   var lchildren = document.getElementById("fuzzbot-triples-listbox");

   _fuzzbotLog("L1");
   
   // create Treerow with id (rowid is a global variable so that
   // we do not use the same id twice)
   var url = gBrowser.contentDocument.URL;
   var li = document.createElement("listitem");
   var lcs = document.createElement("listcell");
   var lcp = document.createElement("listcell");
   var lco = document.createElement("listcell");

   _fuzzbotLog("L2");

   // correct the subject for display
   var relativeSubject = triple.subject;
   if(triple.subject != url)
   {
      relativeSubject = relativeSubject.replace(url, "");
   }
   lcs.setAttribute("label", relativeSubject);
   lcs.value = triple.subject;

   _fuzzbotLog("L3");

   // correct the predicate for display
   var predicateCurie = triple.predicate;
   for(var i in gTripleStore["@prefix"])
   {
      var prefixTriple = gTripleStore["@prefix"][i];
      var prefix = prefixTriple.predicate;
      var uri = prefixTriple.object;
      var replacement = prefix + ":";

      predicateCurie = predicateCurie.replace(uri, replacement);
   }
   lcp.setAttribute("label", predicateCurie);
   lcp.value = triple.predicate;
   
   _fuzzbotLog("L4");
   
   lco.setAttribute("label", triple.object);
   lco.value = triple.object;
   
   li.appendChild(lcs);
   li.appendChild(lcp);
   li.appendChild(lco);

   _fuzzbotLog("L5");
   
   lchildren.appendChild(li);
   
   return true;
};

/**
 * Clears the triples that are being shown on the screen.
 */
function clearUiTriples()
{
   _fuzzbotLog("clearUiTriples()");
   
   // clear the current list of children
   var lb = document.getElementById("fuzzbot-triples-listbox");
   while(lb.firstChild)
   {
      lb.removeChild(lb.firstChild);
   }

   // Create the list header and columns layout information
   var lbhead = document.createElement("listhead");
   var lhs = document.createElement("listheader");
   var lhp = document.createElement("listheader");
   var lho = document.createElement("listheader");
   var lbcols = document.createElement("listcols");
   var lcs = document.createElement("listcol");
   var lcp = document.createElement("listcol");
   var lco = document.createElement("listcol");

   // setup each listbox item
   lhs.setAttribute("label", "Subject");
   lhp.setAttribute("label", "Predicate");
   lho.setAttribute("label", "Object");

   lco.setAttribute("flex", "1");

   // put the entire UI together
   lbhead.appendChild(lhs);
   lbhead.appendChild(lhp);
   lbhead.appendChild(lho);

   lbcols.appendChild(lcs);
   lbcols.appendChild(lcp);
   lbcols.appendChild(lco);

   lb.appendChild(lbhead);
   lb.appendChild(lbcols);

   // re-initialize the triple-store
   gTripleStore = {};
   tripleHandler(
      "@prefix", "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
   tripleHandler(
      "@prefix", "xhv", "http://www.w3.org/1999/xhtml/vocab#");
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
