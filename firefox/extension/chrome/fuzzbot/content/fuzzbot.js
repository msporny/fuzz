/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
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

/* Constants */
var RDFA_PARSE_WARNING = -2;
var RDFA_PARSE_FAILED = -1;
var RDFA_PARSE_UNKNOWN = 0;
var RDFA_PARSE_SUCCESS = 1;

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
 * Adds icons to the URL bar depending on what types of triples, if any, were
 * detected on the page.
 */
function addUrlBarIcons()
{
   //var fuzzbotIcon = document.getElementById("fuzzbot-urlbar-icon");
   var fuzzbotAudioIcon = document.getElementById("fuzzbot-urlbar-audio-icon");
   var fuzzbotVideoIcon = document.getElementById("fuzzbot-urlbar-video-icon");
   var fuzzbotFoafPersonIcon = 
      document.getElementById("fuzzbot-urlbar-foaf-person-icon");

   /* Display audio icon */
   if(gTripleRdfTypes["http://purl.org/media/audio#Recording"] ||
      gTripleRdfTypes["http://purl.org/media/audio#Album"])
   {
       fuzzbotAudioIcon.setAttribute("objectsDetected", "true");
   }
   else
   {
       fuzzbotAudioIcon.removeAttribute("objectsDetected");
   }

   /* Display video icon */
   if(gTripleRdfTypes["http://purl.org/media/video#Recording"] ||
      gTripleRdfTypes["http://purl.org/media/video#Episode"] ||
      gTripleRdfTypes["http://purl.org/media/video#Movie"] ||
      gTripleRdfTypes["http://purl.org/media/video#Series"])
   {
       fuzzbotVideoIcon.setAttribute("objectsDetected", "true");
   }
   else
   {
       fuzzbotVideoIcon.removeAttribute("objectsDetected");
   }

   /* Display FOAF Person icon */
   if(gTripleRdfTypes["http://xmlns.com/foaf/0.1/Person"])
   {
       fuzzbotFoafPersonIcon.setAttribute("objectsDetected", "true");
   }
   else
   {
       fuzzbotFoafPersonIcon.removeAttribute("objectsDetected");
   }

   /* Display general Fuzzbot UI */
   //if(gNumTriples > 2)
   //{
   //    fuzzbotIcon.setAttribute("objectsDetected", "true");
   //}
}

/**
 * Removes all Fuzzbot icons from the URL bar.
 */
function removeUrlBarIcons()
{
   //var fuzzbotIcon = document.getElementById("fuzzbot-urlbar-icon");
   var fuzzbotAudioIcon = document.getElementById("fuzzbot-urlbar-audio-icon");
   var fuzzbotVideoIcon = document.getElementById("fuzzbot-urlbar-video-icon");
   var fuzzbotFoafPersonIcon = 
      document.getElementById("fuzzbot-urlbar-foaf-person-icon");

   //fuzzbotIcon.removeAttribute("objectsDetected");
   fuzzbotAudioIcon.removeAttribute("objectsDetected");
   fuzzbotVideoIcon.removeAttribute("objectsDetected");
   fuzzbotFoafPersonIcon.removeAttribute("objectsDetected");
}

/**
 * Updates the Firefox display window with the updated status.
 */
function updateFuzzbotStatusDisplay()
{
   var statusImage = document.getElementById("fuzzbot-status-image");
   var ui = document.getElementById("fuzzbot-ui");
   var disabled = document.getElementById("fuzzbot-ui-disable");

   // update the image and the label
   if((gNumTriples > 2) && !disabled.hasAttribute("checked"))
   {
      statusImage.src = "chrome://fuzzbot/content/fuzzbot16-online.png";
      // FIXME: Temporarily removed, don't know if this is the proper approach
      //removeFuzzbotMarkup();
      //addFuzzbotMarkup();
      addUrlBarIcons();
   }
   else
   {
      statusImage.src = "chrome://fuzzbot/content/fuzzbot16-offline.png";
      // FIXME: Temporarily removed, don't know if this is the proper 
      //        approach.
      //removeFuzzbotMarkup();
      removeUrlBarIcons();
   }
}

// This observer is responsible for detecting triples that are
// generated via the C++ XPCOM librdfa parser.
function tripleHandler(subject, predicate, object)
{
   if(subject != "@prefix")
   {
      gNumTriples += 1;
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
   if(!gTripleStore[subject])
   {
      gTripleStore[subject] = new Array();
   }

   // If the type hasn't been saved in the rdf types hastable, save it.
   if(predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && 
      !gTripleRdfTypes[object])
   {
       gTripleRdfTypes[object] = true;
   }
   
   gTripleStore[subject].push(triple);
   _fuzzbotLog("Stored: " + triple.subject + " " + triple.predicate + " " +
               triple.object + " .");

   //addTripleToUi(triple);
   
   return true;
};

/**
 * Updates the list of triples in the Fuzzbot Triple UI.
 */
function updateFuzzbotTripleUi()
{
   // Populate the UI
   clearUiTriples();
   for(var i in gTripleStore)
   {
      for(var j in gTripleStore[i])
      {
         addTripleToUi(gTripleStore[i][j]);
      }
   }
}

/**
 * Hides or displays the Fuzzbot UI on the current page.
 */
function toggleFuzzbotTripleUi()
{
   var ui = document.getElementById("fuzzbot-ui");
   var uiControl = document.getElementById("fuzzbot-ui-control");
   var disable = document.getElementById("fuzzbot-ui-disable");

   if(uiControl.label == "Hide Raw Triples" || disable.hasAttribute("checked"))
   {
      uiControl.setAttribute("label", "Examine Raw Triples");
      ui.hidden = true;
   }
   else
   {
      updateFuzzbotTripleUi();
      uiControl.setAttribute("label", "Hide Raw Triples");
      ui.hidden = false;
   }
}

/**
 * Adds a triple to the UI given a triple object.
 *
 * @param triple the triple to add to the UI.
 */
function addTripleToUi(triple)
{
   var lchildren = document.getElementById("fuzzbot-triples-listbox");

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
   for(var i in gTripleStore["@prefix"])
   {
      var prefixTriple = gTripleStore["@prefix"][i];
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
function clearTriples()
{
   // re-initialize the triple-store
   gTripleStore = {};
   gTripleRdfTypes = {};
   gNumTriples = 0;
   tripleHandler(
      "@prefix", "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
   tripleHandler(
      "@prefix", "xhv", "http://www.w3.org/1999/xhtml/vocab#");
}

/**
 * Clears the triples that are being shown on the screen.
 */
function clearUiTriples()
{
   // clear the current list of children
   var lb = document.getElementById("fuzzbot-triples-listbox");
   while(lb.firstChild)
   {
      lb.removeChild(lb.firstChild);
   }
}

/**
 * Starts a thread to perform semantic data detection on the page.
 */
function detectSemanticData()
{
   var disabled = document.getElementById("fuzzbot-ui-disable");
   if(disabled.hasAttribute("checked"))
   {      
      toggleFuzzbotTripleUi();
      updateFuzzbotStatusDisplay();
      return;
   }

   var serializer = new XMLSerializer();
   var url = gBrowser.selectedBrowser.contentDocument.URL;
   var xml =
      serializer.serializeToString(gBrowser.selectedBrowser.contentDocument);

   //_fuzzbotLog(xml);
   
   var gPlugin = Components
      .classes["@rdfa.digitalbazaar.com/fuzzbot/xpcom;1"]
      .getService()
      .QueryInterface(
         Components.interfaces.nsIFuzzbotExtension);
   
   clearTriples();

   var rval = gPlugin.processRdfaTriples(url, xml, tripleHandler);

   // if the previous parse failed, it is usually because the input
   // document is malformed. Instruct Fuzzbot to use Tidy to clean up
   // the incoming HTML/XHTML and retry.
   if(rval != RDFA_PARSE_SUCCESS)
   {
      clearTriples();
      gPlugin.tidyAndProcessRdfaTriples(url, xml, tripleHandler);
   }
   
   updateFuzzbotStatusDisplay();
}

/**
 * Attaches the HTML document listeners to ensure proper detection and
 * parsing of RDFa.
 */
function attachDocumentListeners()
{
   _fuzzbotLog("attachDocumentListeners()");
   
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
function tabSelected(event)
{
   _fuzzbotLog("tabSelected");
   detectSemanticData();

   var uiControl = document.getElementById("fuzzbot-ui-control");
   if(!uiControl.hidden)
   {
      updateFuzzbotTripleUi();
   }
}
