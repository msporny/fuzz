/**
 * The Fuzzbot extension Javascript functionality for user interface 
 *management.
 *
 * @author Manu Sporny
 */

/* Global variables that track the state of this plugin */
var gFuzzbotVisible = true;

/* The triple store contains all of the triples on the current page. */
var gTripleStore = {};

/* The triple RDF types contains all of the types of triples found in
   the current document. */
var gTripleRdfTypes = {};

/* The number of triples in the current document. */
var gNumTriples = 0;

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
 * Create a menu item given a label and an action to execute when the menu
 * item is selected.
 *
 * @param label the label to use to identify the menu item.
 * @param action the Javascript action to execute when the menu item is clicked.
 */
function createMenuItem(label, action) 
{
   const XUL_NS = 
      "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
   var menuitem = document.createElementNS(XUL_NS, "menuitem");
   menuitem.setAttribute("label", label);
   menuitem.addEventListener("click", action, false);

   return menuitem;
}

/**
 * Callback to perform a search action, called by the audio details dialog.
 *
 * @param event the event object to process.
 */
function performSearch(event)
{
   var service = event.currentTarget.getAttribute("service");
   var serviceType = event.currentTarget.getAttribute("serviceType");
   var query = event.currentTarget.getAttribute("query");
   var url = "about:";

   // construct the URL for MusicBrainz if that is the destined service
   if(service == "musicbrainz")
   {
      url = "http://musicbrainz.org/search/textsearch.html?query=" + 
         query  + "&type=" + serviceType;
   }

   // create a new tab for the search
   newTab = window.opener.getBrowser().addTab(url);
   windows.opener.getBrowser().selectedTab = newTab;

   event.stopPropagation();
}

/**
 * Callback to open a URL in a tab.
 *
 * @param event the event object to process.
 */
function openUrlInNewTab(event)
{
   var url = event.currentTarget.getAttribute("href");

   // create a new tab for the search
   newTab = window.opener.getBrowser().addTab(url);
   windows.opener.getBrowser().selectedTab = newTab;

   event.stopPropagation();
}
