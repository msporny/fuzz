/**
 * The Fuzz extension Javascript functionality for user interface 
 *management.
 *
 * @author Manu Sporny
 */

/* Global variables that track the state of this plugin */
var gFuzzVisible = true;

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
function _fuzzLog(msg)
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
   var serviceArgumentsJSON = 
      event.currentTarget.getAttribute("serviceArguments");
   var serviceArguments = JSON.parse(serviceArgumentsJSON);
   var query = event.currentTarget.getAttribute("query");
   var url = "about:";

   // construct the URL for MusicBrainz if that is the destined service
   if(service == "musicbrainz")
   {
      url = "http://musicbrainz.org/search/textsearch.html?query=" + query;
   }
   else if(service == "imdb")
   {
      url = "http://www.imdb.com/find?q=" + query;
   }
   else if(service == "fandango")
   {
      url = "http://www.fandango.com/GlobalSearch.aspx?q=" + query;
   }
   else if(service == "wikipedia")
   {
      url = "http://en.wikipedia.org/wiki/Special:Search?search=" + query;
   }
   else if(service == "rotten-tomatoes")
   {
      url = "http://www.rottentomatoes.com/search/full_search.php?search=" + 
         query;
   }

   // Add the service arguments to the end of the URL
   for(arg in serviceArguments)
   {
      var val = serviceArguments[arg];
      url = url + "&" + arg + "=" + val;
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

/**
 * Builds an action menu given the input text for the action and the ID
 * of the menupopup.
 *
 * @param id The ID for the menupopup.
 * @param label the label of the menu item.
 * @param service the service to query.
 * @param serviceArguments The arguments to pass to the service.
 * @param query the query to use when checking the service.
 */
function buildActionMenu(id, label, service, serviceArguments, query)
{
   var actionMenu = document.getElementById(id);
   var serviceArgumentsJSON = JSON.stringify(serviceArguments);

   // Create the search menuitem
   var menuItem = createMenuItem(label, performSearch);
   menuItem.setAttribute("service", service);
   menuItem.setAttribute("serviceArguments", serviceArgumentsJSON);
   menuItem.setAttribute("query", query);
   actionMenu.appendChild(menuItem);
}

/**
 * Clears the contents of an action menu given the id for the menu.
 *
 * @param id The ID for the menupopup.
 */
function clearActionMenu(id)
{
   var actionMenu = document.getElementById(id);

   // Clear the current contents of the action menu
   while(actionMenu.firstChild)
   {
      actionMenu.removeChild(actionMenu.firstChild);
   }   
}