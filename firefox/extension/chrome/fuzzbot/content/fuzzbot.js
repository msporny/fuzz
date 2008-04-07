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
      //ui.hidden = gFuzzbotVisible;
      
      if(!gFuzzbotVisible)
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
      //ui.hidden = true;
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

   //addTripleToUi(triple);
   
   return true;
};

/**
 * Adds a triple to the UI given a triple object.
 *
 * @param triple the triple to add to the UI.
 */
function addTripleToUi(triple)
{
   var lchildren = document.getElementById("fuzzbot-triples-listbox");

   _fuzzbotLog("L1");
   
   // create Treerow with id (rowid is a global variable so that
   // we do not use the same id twice)
   var url = gBrowser.contentDocument.URL;
   var rli = document.createElement("richlistitem");
   var lhs = document.createElement("hbox");
   var ls = document.createElement("label");
   var lhp = document.createElement("hbox");
   var lp = document.createElement("label");
   var lho = document.createElement("hbox");
   var lo = document.createElement("label");

   _fuzzbotLog("L2");

   // setup the hbox dimensions
   lhs.setAttribute("minwidth", "100");
   lhs.setAttribute("maxwidth", "250");
   lhp.setAttribute("minwidth", "100");
   lhp.setAttribute("maxwidth", "250");
   lho.setAttribute("minwidth", "100");
   lho.setAttribute("flex", "1");
   
   // setup the correct styles for the elements
   if(triple.subject.indexOf("http://") == 0)
   {
      ls.setAttribute("class", "text-link");
      ls.setAttribute("href", triple.subject);
   }
   lp.setAttribute("class", "text-link");
   lp.setAttribute("href", triple.predicate);
   
   if(triple.object.indexOf("http://") == 0)
   {
      lo.setAttribute("class", "text-link");
      lo.setAttribute("href", triple.object);
   }
   
   // correct the subject for display
   var relativeSubject = triple.subject;
   if(triple.subject != url)
   {
      relativeSubject = relativeSubject.replace(url, "");
   }
   ls.setAttribute("value", relativeSubject);
   
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
   lp.setAttribute("value", predicateCurie);
   
   _fuzzbotLog("L4");
   
   lo.setAttribute("value", triple.object);
   
   lhs.appendChild(ls);
   lhp.appendChild(lp);
   lho.appendChild(lo);

   rli.appendChild(lhs);
   rli.appendChild(lhp);
   rli.appendChild(lho);

   _fuzzbotLog("L5");
   
   lchildren.appendChild(rli);   
}

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
