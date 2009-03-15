/**
 * The Fuzz Example extension Javascript functionality for Firefox.
 *
 * @author Manu Sporny
 */

/* The triple store contains all of the triples on the current page. */
var gFuzzExampleTripleStore = {};

/* The number of triples in the current document. */
var gFuzzExampleNumTriples = 0;

/* The global triple UI reference */
var gFuzzExampleTripleUi = null;

/**
 * Logs a message to the Firefox error console.
 *
 * @param msg the message to log to the Firefox error console.
 */
function _fuzzExampleLog(msg)
{
   Components
      .classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces["nsIConsoleService"])
      .logStringMessage(msg);
}

/**
 * Updates the Firefox display window with the updated status.
 */
function updateFuzzExampleStatusDisplay()
{
   var statusImage = document.getElementById("fuzz-example-status-image");
   var ui = document.getElementById("fuzz-example-ui");

   // update the image and the label
   if((gNumTriples > 2))
   {
      statusImage.src = "chrome://fuzz-example/content/fuzz16-online.png";
   }
   else
   {
      statusImage.src = "chrome://fuzz-example/content/fuzz16-offline.png";
   }
}

// This function is called whenever triples are generated via the
// Fuzz extension.
function tripleHandler(data)
{
   if(data.subject != "@prefix")
   {
      gNumTriples += 1;
   }

   // strip any whitespace
   var strippedObject = data.object.replace(/\r/g, " ");
   strippedObject = strippedObject.replace(/\n/g, " ");
   strippedObject = strippedObject.replace(/\t/g, " ");
   strippedObject = strippedObject.replace(/ +/g, " ");
   strippedObject = strippedObject.replace(/^ +/g, "");
   
   triple = new Object();
   triple.subject = data.subject;
   triple.predicate = data.predicate;
   triple.object = strippedObject;
   triple.language = data.language;
   triple.datatype = data.datatype;

   // If the subject doesn't exist in the triple store, create it.
   if(!gFuzzExampleTripleStore[data.subject])
   {
      gFuzzExampleTripleStore[data.subject] = new Array();
   }

   gFuzzExampleTripleStore[data.subject].push(triple);
   _fuzzExampleLog("Fuzz Example Stored: " + 
      triple.subject + " " + triple.predicate + " " + triple.object + " .");

   return true;
};

/**
 * Updates the list of triples in the FuzzExample Triple UI.
 */
function updateFuzzExampleTripleUi()
{
   // Populate the UI
   clearUiTriples();
   for(var i in gFuzzExampleTripleStore)
   {
      for(var j in gFuzzExampleTripleStore[i])
      {
         addTripleToUi(gFuzzExampleTripleStore[i][j]);
      }
   }
}

/**
 * Hides or displays the FuzzExample UI on the current page.
 */
function toggleFuzzExampleTripleUi()
{
   if(gFuzzExampleTripleUi == null)
   {
      gFuzzExampleTripleUi = window.openDialog(
         "chrome://fuzz-example/content/example_triple_display.xul", 
         "Fuzz Example Triple Display");
   }

   if(gFuzzExampleTripleUi.hidden)
   {
      updateFuzzExampleTripleUi();
   }

   gFuzzExampleTripleUi.hidden = !gFuzzExampleTripleUi.hidden;
}

/**
 * Adds a triple to the UI given a triple object.
 *
 * @param triple the triple to add to the UI.
 */
function addTripleToUi(triple)
{
   var textBox = document.getElementById("fuzz-example-triple-textbox");

   textBox.value = textBox.value + 
                   "<" + triple.subject + ">\n" +
                   "   <" + triple.predicate + ">\n" +
                   "      " + triple.object + "\n\n";
}

/**
 * Clears the currently tracked triples.
 */
function clearTriples()
{
   // re-initialize the triple-store
   gFuzzExampleTripleStore = {};
   gFuzzExampleNumTriples = 0;
}

/**
 * Clears the triples that are being shown on the screen.
 */
function clearUiTriples()
{
   var textBox = document.getElementById("fuzz-example-triple-textbox");

   textBox.value = "";
}

/**
 * The Fuzz Triple Observer is used to listen to RDF triple events created by
 * the Fuzz Firefox Add On. 
 */
const FuzzTripleObserver = 
{
   observe: function(subject, topic, data)
   {
      if(topic == "fuzz-triple-detected")
      {
         tripleHandler(data);
      }
      else if(topic == "fuzz-triple-extraction-start")
      {
         clearTriples();
      }
      else if(topic == "fuzz-triple-extraction-complete")
      {
	 updateFuzzExampleStatusDisplay();
      }
      else if(topic == "fuzz-triple-warning")
      {
      }
   }
};

// register the Fuzz Triple observer.
const service = Components.classes["@mozilla.org/observer-service;1"]
   .getService(Components.interfaces.nsIObserverService);
service.addObserver(RdfTripleObserver, "fuzz-triple-detected", false);
service.addObserver(RdfTripleObserver, "fuzz-triple-extraction-start", false);
service.addObserver(RdfTripleObserver, "fuzz-triple-warning", false);
