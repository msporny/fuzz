/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */

var gFuzzbotVisible = true;
var gAvailableTriples = false;

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
   _fuzzbotLog(subject + " " + predicate + " " + object + " .");
   
   tchildren = document.getElementById("fuzzbot-triple-tree-children");

   _fuzzbotLog(tchildren);

   // create Treerow with id (rowid is a global variable so that
   // we do not use the same id twice)
   var ti = document.createElement("treeitem");
   var tr = document.createElement("treerow");
   var tcs = document.createElement("treecell");
   var tcp = document.createElement("treecell");
   var tco = document.createElement("treecell");
   tcs.setAttribute("label", subject);
   tcp.setAttribute("label", predicate);
   tco.setAttribute("label", object);
   
   tr.appendChild(tcs);
   tr.appendChild(tcp);
   tr.appendChild(tco);
   ti.appendChild(tr);
   
   tchildren.appendChild(ti);
   
   return true;
};

/**
 * Starts a thread to perform semantic data detection on the page.
 */
function detectSemanticData(obj)
{
   var serializer = new XMLSerializer();
   var url = gBrowser.contentDocument.URL;
   var xml = serializer.serializeToString(gBrowser.contentDocument);
   var gPlugin = Components
      .classes["@rdfa.digitalbazaar.com/fuzzbot/xpcom;1"]
      .getService()
      .QueryInterface(
         Components.interfaces.nsIFuzzbotExtension);
   
   // clear the current list of children
   tchildren = document.getElementById("fuzzbot-triple-tree-children");
   while(tchildren.firstChild)
   {
      tchildren.removeChild(tchildren.firstChild);
   }

   gAvailableTriples = false;
   var rval = gPlugin.processRdfaTriples(url, xml, tripleHandler);

   updateFuzzbotStatusDisplay(gAvailableTriples);
}
