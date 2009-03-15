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

