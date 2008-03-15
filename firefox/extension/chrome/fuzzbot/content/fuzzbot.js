/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */

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
function updateFuzzbotStatusDisplay(obj)
{
   status = "offline";

   // Check to see if the object has a status of online, otherwise
   // assume the Fuzzbot application is offline.
   if(obj.status && (obj.status == "online"))
   {
      status = "online";
   }
   else
   {
      status = "offline";
      gFuzzbotPid = 0;
   }

   // if the old status doesn't equal the new status, update the UI
   if(gFuzzbotStatus != status)
   {
      statusImage = document.getElementById("fuzzbot-status-image");
      statusLabel = document.getElementById("fuzzbot-status-label");
      controlLabel = document.getElementById("fuzzbot-control-label");

      // update the image and the label
      if(status == "online")
      {
         statusImage.src = "chrome://fuzzbot/content/fuzzbot16-online.png";
         statusLabel.value = "online";
         controlLabel.label = "Sleeping";
      }
      else
      {
         statusImage.src = "chrome://fuzzbot/content/fuzzbot16-offline.png";
         statusLabel.value = "offline";
         controlLabel.label = "Awake";
      }

      gFuzzbotStatus = status;
   }
}

/**
 * Starts a thread to perform semantic data detection on the page.
 */
function detectSemanticData(obj)
{
   var gPlugin = Components
      .classes["@rdfa.digitalbazaar.com/fuzzbot/xpcom;1"]
      .getService()
      .QueryInterface(
         Components.interfaces.nsIFuzzbotExtension);
      
   gPlugin.detectSemanticData("XHTML DATA");
}
