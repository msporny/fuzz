/**
 * The Fuzz Example extension Javascript functionality for the 
 * Firefox web browser.
 *
 * This is an example Firefox plug-in that uses the Fuzz Firefox
 * plugin to perform triple discovery in web pages. This plugin
 * then takes the discovered triples and displays them in a small
 * window when the "Fe" icon is clicked in the Firefox status
 * bar at the bottom of the window. 
 *
 * This extension is provided as a starting point for other 
 * Fuzz extension writers and for anybody that would like to use
 * the power of RDFa in their Firefox extensions without having
 * to write an RDFa parser from scratch.
 *
 * Fuzz uses a very fast and powerful RDFa parser called librdfa,
 * which is capable of processing more than 8,000 triples per
 * second (which is over 80MB of data per second) on an Athlon 
 * XP 1800+ processor.
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
 * Logs a message to the Firefox error console, which can be accessed by
 * typing CTRL+SHIFT+J.
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
 * Updates the Firefox status bar icon with a colored version of the icon
 * if triples are available, or a gray versiono f the icon if no triples
 * were discovered.
 */
function fuzzExampleUpdateStatusDisplay()
{
   var statusImage = document.getElementById("fuzz-example-status-image");

   // update the status bar image icon
   if(gFuzzExampleNumTriples > 0)
   {
      statusImage.src = 
         "chrome://fuzz-example/content/fuzz-example16-online.png";
   }
   else
   {
      statusImage.src = 
         "chrome://fuzz-example/content/fuzz-example16-offline.png";
   }
}

/**
 * This function is called by the FuzzTripleObserver whenever a triple
 * is detected. The data passed to the function must contain a subject,
 * predicate, object, language and datatype.
 *
 * @param data the triple that was discovered, which must contain a
 *             subject, predicate, object, language and datatype.
 */
function fuzzExampleTripleHandler(data)
{
   // don't count the triple if it is a prefix
   if(data.subject != "@prefix")
   {
      gFuzzExampleNumTriples += 1;
   }

   // strip any whitespace from the object literal
   var strippedObject = data.object.replace(/\r/g, " ");
   strippedObject = strippedObject.replace(/\n/g, " ");
   strippedObject = strippedObject.replace(/\t/g, " ");
   strippedObject = strippedObject.replace(/ +/g, " ");
   strippedObject = strippedObject.replace(/^ +/g, "");
   
   // create a new triple object
   triple = new Object();
   triple.subject = data.subject;
   triple.predicate = data.predicate;
   triple.object = strippedObject;
   triple.language = data.language;
   triple.datatype = data.datatype;

   // if the subject doesn't exist in the triple store, create it
   if(!gFuzzExampleTripleStore[data.subject])
   {
      gFuzzExampleTripleStore[data.subject] = new Array();
   }

   gFuzzExampleTripleStore[data.subject].push(triple);
};

/**
 * Updates the list of triples in the FuzzExample triple UI. At the moment
 * the formatting and display of the data is very simplistic - just a long
 * list of triples in a text area.
 */
function fuzzExampleUpdateTripleUi()
{
   var triples = "";

   // Build the triple text
   for(var i in gFuzzExampleTripleStore)
   {
      for(var j in gFuzzExampleTripleStore[i])
      {
	 var triple = gFuzzExampleTripleStore[i][j];
         var subject = triple.subject;
         var predicate = triple.predicate;
         var object = triple.object;

         // surround any URL with angle brackets
	 if(subject.indexOf("http://") == 0)
	 {
	    subject = "<" + subject + ">";
	 }
	 if(predicate.indexOf("http://") == 0)
	 {
	    predicate = "<" + predicate + ">";
	 }
	 if(object.indexOf("http://") == 0)
	 {
	    object = "<" + object + ">";
	 }
         else
         {
	    object = "\"" + object + "\"";
	 }

         // format @prefix data differently from non-@prefix data
         if(subject != "@prefix")
	 {
            triples = triples + subject + "\n   " + predicate + "\n      " + 
               object + " .\n\n";
	 }
         else
	 {
            triples = 
               triples + subject + " " + predicate + " " + object + " .\n\n";
	 }
      }
   }

   // set the triple text for the text box
   if(gFuzzExampleTripleUi != null)
   {
      var textBox = gFuzzExampleTripleUi.document.getElementById(
         "fuzz-example-triple-textbox");
      textBox.value = triples;
   }
}

/**
 * Hides or displays the FuzzExample UI.
 */
function fuzzExampleToggleTripleUi()
{
   // if the triple UI has not been created, create it
   // if it has already been created, destroy it
   if(gFuzzExampleTripleUi == null)
   {
      gFuzzExampleTripleUi = window.openDialog(
         "chrome://fuzz-example/content/fuzz_example_triple_display.xul", 
         "Fuzz Example Triple Display", "chrome,centerscreen");
      gFuzzExampleTripleUi.ondialogaccept = fuzzExampleToggleTripleUi;
      gFuzzExampleTripleUi.onload = fuzzExampleUpdateTripleUi;
   }
   else
   {
      gFuzzExampleTripleUi.close();
      gFuzzExampleTripleUi = null;
   }
}

/**
 * Clears all of the triples in the local triple store.
 */
function fuzzExampleClearTriples()
{
   // re-initialize the triple-store
   gFuzzExampleTripleStore = {};
   gFuzzExampleNumTriples = 0;
}

/**
 * The Fuzz Triple Observer is used to listen to RDF triple events created by
 * the Fuzz Firefox Add-on. The triple observer is registered with the Fuzz
 * extension and the "observe" function is called whenever there is a 
 * Fuzz-based triple event.
 */
FuzzExampleTripleObserver = 
{
   /**
    * The observer function is called whenever there is a Fuzz-based triple
    * event.
    *
    * @param topic The topic of the event, which is a text string describing
    *              the event.
    * @param data The data associated with the event, usually a triple.
    */
   observe: function(topic, data)
   {
      if(topic == "fuzz-triple-detected")
      {
         fuzzExampleTripleHandler(data);
      }
      else if(topic == "fuzz-triple-extraction-start")
      {
         fuzzExampleClearTriples();
	 fuzzExampleUpdateStatusDisplay();
      }
      else if(topic == "fuzz-triple-extraction-complete")
      {
	 fuzzExampleUpdateStatusDisplay();
      }
      else if(topic == "fuzz-triple-warning")
      {
         _fuzzExampleLog("fuzz-triple-warning not implemented!");
      }
   }
};

// register the Fuzz triple observer
Fuzz.addObserver(FuzzExampleTripleObserver);
