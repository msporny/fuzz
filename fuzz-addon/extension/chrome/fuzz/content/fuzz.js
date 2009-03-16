/**
 * The Fuzz extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */

/* Constants */
var RDFA_PARSE_WARNING = -2;
var RDFA_PARSE_FAILED = -1;
var RDFA_PARSE_UNKNOWN = 0;
var RDFA_PARSE_SUCCESS = 1;

/* Global list of all Fuzz event observers */
var gFuzzObservers = new Array();

/* Global variables that track the state of this plugin */
var gFuzzVisible = true;

/* The triple store contains all of the triples on the current page. */
var gFuzzTripleStore = {};

/* The triple RDF types contains all of the types of triples found in
   the current document. */
var gFuzzRdfTypes = {};

/* The number of triples in the current document. */
var gFuzzNumTriples = 0;

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
function fuzzGetCurrentWindow()
{
   return window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
             .getInterface(Components.interfaces.nsIWebNavigation)
             .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
             .rootTreeItem
             .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
             .getInterface(Components.interfaces.nsIDOMWindow);
}

/**
 * Open a new tab showing the status of the Fuzz software.
 */
function fuzzShowStatus()
{
   mainWindow = fuzzGetCurrentWindow();
   newTab = mainWindow.getBrowser().addTab(
      "about:");
   mainWindow.getBrowser().selectedTab = newTab;
}

/**
 * Sets a timer to update the interface from time to time to show the person
 * on the current system the status of the Fuzz software.
 */
function fuzzUpdateStatus()
{
   //mainWindow = fuzzGetCurrentWindow();

   window.setTimeout(fuzzUpdateStatus, 1000);
}

/**
 * Updates the Firefox display window with the updated status.
 */
function fuzzUpdateStatusDisplay()
{
   var statusImage = document.getElementById("fuzz-status-image");
   var ui = document.getElementById("fuzz-ui");
   var disabled = document.getElementById("fuzz-ui-disable");

   // update the image and the label
   if((gFuzzNumTriples > 2) && !disabled.hasAttribute("checked"))
   {
      statusImage.src = "chrome://fuzz/content/fuzz16-online.png";
   }
   else
   {
      statusImage.src = "chrome://fuzz/content/fuzz16-offline.png";
   }
}

// This observer is responsible for detecting triples that are
// generated via the C++ XPCOM librdfa parser.
function fuzzTripleHandler(subject, predicate, object)
{
   if(subject != "@prefix")
   {
      gFuzzNumTriples += 1;
   }

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

   // If the subject doesn't exist in the triple store, create it.
   if(!gFuzzTripleStore[subject])
   {
      gFuzzTripleStore[subject] = new Array();
   }

   // If the type hasn't been saved in the rdf types hastable, save it.
   if(predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && 
      !gFuzzRdfTypes[object])
   {
       gFuzzRdfTypes[object] = true;
   }
   
   gFuzzTripleStore[subject].push(triple);
   _fuzzLog("Stored: " + triple.subject + " " + triple.predicate + " " +
               triple.object + " .");

   // broadcast the object
   // register the Fuzz Triple observer.
   for(observer in gFuzzObservers)
   {
       _fuzzLog("Observer.observe == " + typeof(observer));
      observer.observe("fuzz-triple-detected", triple);
   }

   return true;
};

/**
 * Updates the list of triples in the Fuzz Triple UI.
 */
function fuzzUpdateTripleUi()
{
   // Populate the UI
   fuzzClearUiTriples();
   for(var i in gFuzzTripleStore)
   {
      for(var j in gFuzzTripleStore[i])
      {
         fuzzAddTripleToUi(gFuzzTripleStore[i][j]);
      }
   }
}

/**
 * Hides or displays the Fuzz UI on the current page.
 */
function fuzzToggleTripleUi()
{
   var ui = document.getElementById("fuzz-ui");
   var uiControl = document.getElementById("fuzz-ui-control");
   var disable = document.getElementById("fuzz-ui-disable");

   if(uiControl.label == "Hide Raw Triples")
   {
      uiControl.setAttribute("label", "Examine Raw Triples");
      ui.hidden = true;
   }
   else
   {
      fuzzUpdateTripleUi();
      uiControl.setAttribute("label", "Hide Raw Triples");
      ui.hidden = false;
   }
}

/**
 * Adds a triple to the UI given a triple object.
 *
 * @param triple the triple to add to the UI.
 */
function fuzzAddTripleToUi(triple)
{
   var lchildren = document.getElementById("fuzz-triples-listbox");

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

   // setup the hbox dimensions
   lhs.setAttribute("minwidth", "200");
   lhs.setAttribute("maxwidth", "250");
   lhp.setAttribute("minwidth", "200");
   lhp.setAttribute("maxwidth", "250");
   lho.setAttribute("minwidth", "200");
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
   
   // correct the predicate for display
   var predicateCurie = triple.predicate;
   for(var i in gFuzzTripleStore["@prefix"])
   {
      var prefixTriple = gFuzzTripleStore["@prefix"][i];
      var prefix = prefixTriple.predicate;
      var uri = prefixTriple.object;
      var replacement = prefix + ":";

      predicateCurie = predicateCurie.replace(uri, replacement);
   }
   lp.setAttribute("value", predicateCurie);
   
   lo.setAttribute("value", triple.object);
   
   lhs.appendChild(ls);
   lhp.appendChild(lp);
   lho.appendChild(lo);

   rli.appendChild(lhs);
   rli.appendChild(lhp);
   rli.appendChild(lho);

   lchildren.appendChild(rli);   
}

/**
 * Clears the currently tracked triples.
 */
function fuzzClearTriples()
{
   // re-initialize the triple-store
   gFuzzTripleStore = {};
   gFuzzRdfTypes = {};
   gFuzzNumTriples = 0;
   fuzzTripleHandler(
      "@prefix", "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
   fuzzTripleHandler(
      "@prefix", "xhv", "http://www.w3.org/1999/xhtml/vocab#");
}

/**
 * Clears the triples that are being shown on the screen.
 */
function fuzzClearUiTriples()
{
   // clear the current list of children
   var lb = document.getElementById("fuzz-triples-listbox");
   while(lb.firstChild)
   {
      lb.removeChild(lb.firstChild);
   }
}

/**
 * Starts a thread to perform semantic data detection on the page.
 */
function fuzzDetectSemanticData()
{
   var disabled = document.getElementById("fuzz-ui-disable");
   if(disabled.hasAttribute("checked"))
   {      
      fuzzToggleTripleUi();
      fuzzUpdateStatusDisplay();
      return;
   }

   var serializer = new XMLSerializer();
   var url = gBrowser.selectedBrowser.contentDocument.URL;
   var xml =
      serializer.serializeToString(gBrowser.selectedBrowser.contentDocument);

   //_fuzzLog(xml);
   
   var gPlugin = Components
      .classes["@rdfa.digitalbazaar.com/fuzz/xpcom;1"]
      .getService()
      .QueryInterface(
         Components.interfaces.nsIFuzzExtension);
   
   fuzzClearTriples();

   var rval = gPlugin.processRdfaTriples(url, xml, fuzzTripleHandler);

   // if the previous parse failed, it is usually because the input
   // document is malformed. Instruct Fuzz to use Tidy to clean up
   // the incoming HTML/XHTML and retry.
   if(rval != RDFA_PARSE_SUCCESS)
   {
      fuzzClearTriples();
      gPlugin.tidyAndProcessRdfaTriples(url, xml, fuzzTripleHandler);
   }
   
   fuzzUpdateStatusDisplay();
}

/**
 * Attaches the HTML document listeners to ensure proper detection and
 * parsing of RDFa.
 */
function fuzzAttachDocumentListeners()
{
   _fuzzLog("fuzzAttachDocumentListeners()");
   
   var container = gBrowser.tabContainer;
   gBrowser.addEventListener("load", tabSelected, false);
   container.addEventListener("TabSelect", tabSelected, false);
}

/**
 * This function is called whenever the HTML document has finished
 * loading.
 *
 * @event the event to use when the HTML document is loaded.
 */
function fuzzTabSelected(event)
{
   _fuzzLog("fuzzTabSelected");
   fuzzDetectSemanticData();

   var uiControl = document.getElementById("fuzz-ui-control");
   if(!uiControl.hidden)
   {
      fuzzUpdateTripleUi();
   }
}

/**
 * The Fuzz object is used for interacting with the Fuzz extension.
 */
/**
 * The Fuzz Triple Observer is used to listen to RDF triple events created by
 * the Fuzz Firefox Add On. 
 */
Fuzz = 
{
   addObserver: function(observer)
   {
       _fuzzLog("Adding observer: " + observer + " " + typeof(observer));
      gFuzzObservers.push(observer);
      for(obs in gFuzzObservers)
      {
	  _fuzzLog("observer: " + obs + " " + typeof(obs));
      }
   }
};
