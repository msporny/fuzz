/**
 * The Fuzzbot extension Javascript functionality for the Video vocabulary.
 *
 * @author Manu Sporny
 */

/**
 * The processing data used for the video details panel.
 */
gFuzzbotVideoProcessingData = {
   title : 
   { 
      properties : ["http://purl.org/dc/terms/title",
                    "http://purl.org/dc/elements/1.1/title"],
      value : null
   },
   creator :
   {
      properties : ["http://purl.org/dc/terms/creator",
                    "http://purl.org/dc/elements/1.1/creator"],
      value : null
   },
   contributor :
   {
      properties : ["http://purl.org/dc/terms/contributor",
                    "http://purl.org/dc/elements/1.1/contributor"],
      value : null
   },
   published :
   {
      properties : ["http://purl.org/dc/terms/published",
                    "http://purl.org/dc/elements/1.1/published"],
      value : null
   },
   description :
   {
      properties : ["http://purl.org/dc/terms/description",
                    "http://purl.org/dc/elements/1.1/description"],
      value : null
   },
   position :
   {
      properties : ["http://purl.org/media#position",],
      value : null
   },
   duration :
   {
      properties : ["http://purl.org/dc/terms/duration",
                    "http://purl.org/dc/elements/1.1/duration"],
      value : null
   },
   sample :
   {
      properties : ["http://purl.org/media#sample",],
      value : null
   },
   download :
   {
      properties : ["http://purl.org/media#download",],
      value : null
   },
   depiction :
   {
      properties : ["http://purl.org/media#depiction",],
      value : null
   },
   type :
   {
      properties : ["http://purl.org/dc/terms/type",
                    "http://purl.org/dc/elements/1.1/type"],
      value : null
   },
   rating :
   {
      properties : ["http://purl.org/media#rating"],
      value : null
   },
   license :
   {
      properties : ["http://www.w3.org/1999/xhtml/vocab#license",],
      value : null
   },
   costs :
   {
      properties : ["http://purl.org/commerce#costs",],
      value : null
   },
   payment :
   {
      properties : ["http://purl.org/commerce#payment",],
      value : null
   },
   contains :
   {
      properties : ["http://purl.org/media#contains",],
      value : null
   },
};

/**
 * Creates all of the menu items for the Video AwesomeBar icon menu.
 */
function buildVideoMenuPopup()
{
   var fuzzbotVideoMenu = document.getElementById("fuzzbot-video-menu-popup");
   var videoSubjects = [];

   // Clear the current contents of the video menu popup
   fuzzbotVideoMenu.hidden = true;
   while(fuzzbotVideoMenu.firstChild) 
   {
       fuzzbotVideoMenu.removeChild(fuzzbotVideoMenu.firstChild);
   }

   // Scan the triple store and collect the subjects that are video
   // recordings or albums.
   for(var subject in gTripleStore)
   {
      for(var i in gTripleStore[subject])
      {
         var triple = gTripleStore[subject][i];

         if(triple.predicate == 
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
         {
            if(triple.object == "http://purl.org/media/video#Recording" ||
	       triple.object == "http://purl.org/media/video#Episode" ||
	       triple.object == "http://purl.org/media/video#Movie" ||
               triple.object == "http://purl.org/media/video#Series")
            {
               videoSubjects.push(triple.subject);
               continue;
            }
            else
            {
               continue;
            }
         }
      }
   }

   // for each subject that is an video recording or album, add a menu
   // item for it.
   for(var index in videoSubjects)
   {
      var subject = videoSubjects[index];
      var menuItem = createMenuItem("Unknown", videoSelected);
      menuItem.setAttribute("subject", subject);

      // Set certain menu attributes based on the triple information.
      for(var i in gTripleStore[subject])
      {
         var triple = gTripleStore[subject][i];

	 if(triple.predicate == "http://purl.org/dc/terms/title" ||
            triple.predicate == "http://purl.org/dc/elements/1.1/title")
	 {
	    // Set the name of the menu based on the title information.
	    menuItem.setAttribute("label", triple.object);
	 }
	 else if(triple.predicate == 
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
	 {
	     // Set the menu image based on the RDF type information.
	    if(triple.object == "http://purl.org/media/video#Recording")
	    {
		menuItem.setAttribute("image", 
		   "chrome://fuzzbot/content/displays/rdfTypeVideoRecording.png");
	    }
	    else if(triple.object == "http://purl.org/media/video#Episode")
	    {
		menuItem.setAttribute("image", 
		   "chrome://fuzzbot/content/displays/rdfTypeVideoEpisode.png");
            }
	    else if(triple.object == "http://purl.org/media/video#Movie")
	    {
		menuItem.setAttribute("image", 
		   "chrome://fuzzbot/content/displays/rdfTypeVideoMovie.png");
            }
	    else if(triple.object == "http://purl.org/media/video#Series")
	    {
		menuItem.setAttribute("image", 
		   "chrome://fuzzbot/content/displays/rdfTypeVideoSeries.png");
            }
	 }
      }
      
      fuzzbotVideoMenu.appendChild(menuItem);
   }

   fuzzbotVideoMenu.hidden = false;
}

/**
 * This callback is called whenever an video item has been selected.
 *
 * @param event the Event object that should be used for processing.
 */
function videoSelected(event)
{
   var subj = event.currentTarget.getAttribute("subject");
   //alert("Display UI for Video Subject\n: " + subject);
   var title = "Video Information";
   var params = {inn:{subject:subj, triples:gTripleStore}, out:null};

   // Set certain menu attributes based on the triple information.
   for(var i in gTripleStore[subj])
   {
      var triple = gTripleStore[subj][i];

      if(triple.predicate == "http://purl.org/dc/terms/title" ||
         triple.predicate == "http://purl.org/dc/elements/1.1/title")
      {
	  // Set the name of the menu based on the title information.
	  title = triple.object;
      }
   }

   // create and display the new window.
   var newWindow = 
      window.openDialog("chrome://fuzzbot/content/displays/video.xul", "",
         "chrome, dialog, resizable=yes", params);
   newWindow.focus();
   newWindow.title = title;

   event.stopPropagation();
}

/**
 * This callback is called whenever an video details dialog is loaded.
 */
function initDialog()
{
   var args = window.arguments[0].inn;
   var triples = args.triples;
   var subjectTriples = triples[args.subject];
   var images = ["depiction",];
   var labels = ["title", "creator", "contributor", "published",
      "description", "position", "type", "rating"];
   var buttons = ["sample", "download", "license", "payment"];
   var conversions = ["costs", "duration"];

   // process all of the triples for the given subject and set the appropriate
   // data items in the video processing model
   for(i in subjectTriples)
   {
      var triple = subjectTriples[i];

      // process every term in the processing model
      for(var term in gFuzzbotVideoProcessingData)
      {
	 // process every property for every term in the processing model
         for(var p in gFuzzbotVideoProcessingData[term]["properties"])
	 {
	    var property = gFuzzbotVideoProcessingData[term]["properties"][p];
	    if(triple.predicate == property)
	    {
   	       gFuzzbotVideoProcessingData[term]["value"] = triple.object;
	    }
	 }
      }
   }

   // set all of the UI elements given the processing model
   for(var term in gFuzzbotVideoProcessingData)
   {
       _fuzzbotLog("Searching for " + term);
      var tval = gFuzzbotVideoProcessingData[term]["value"];
      var widget = document.getElementById("fuzzbot-video-details-" + term);

      // select which UI elements to modify based on the name of the attribute
      if(tval != null)
      {
	  if(labels.indexOf(term) >= 0)
	  {
	     // Set the label values
	     widget.value = tval;
	  }
	  else if(buttons.indexOf(term) >= 0)
	  {
	      // Set the button/label actions for URL data
	     var button = 
		 document.getElementById("fuzzbot-video-details-" + term + 
		    "-button");
             widget.setAttribute("href", tval);
             button.setAttribute("href", tval);
	     button.addEventListener("click", openUrlInNewTab, false);
	     widget.value = tval;
	  }
	  else if(images.indexOf(term) >= 0)
	  {
	     // Set the image data
	     widget.src = tval;
	  }
	  else if(conversions.indexOf(term) >= 0)
	  {
	     // For all data that needs to be converted, convert to a 
	     // displayable string value
	     if(term == "costs")
	     {
		widget.value = convertPriceToString(triples[tval]);
	     }
	     else if(term == "duration")
	     {
		widget.value = convertIso8601DurationToString(tval);
	     }
	  }
      }
      else
      {
          var row = 
             document.getElementById("fuzzbot-video-details-row-" + term);
	  row.hidden = true;
      }
   }

   // build the action menus
   clearActionMenu("fuzzbot-video-details-title-menupopup");

   var serviceArguments = {"s":"tt"};
   buildActionMenu("fuzzbot-video-details-title-menupopup",
      "Search IMDB", "imdb", serviceArguments, 
      gFuzzbotVideoProcessingData["title"]["value"]);

   serviceArguments = {"tab":"Movies", repos:"Movies"};
   buildActionMenu("fuzzbot-video-details-title-menupopup",
     "Search Fandango", "fandango", serviceArguments, 
      gFuzzbotVideoProcessingData["title"]["value"]);

   serviceArguments = {"s":"nm"};
   buildActionMenu("fuzzbot-video-details-creator-menupopup",
      "Search IMDB", "imdb", serviceArguments, 
      gFuzzbotVideoProcessingData["creator"]["value"]);

   serviceArguments = {"searchby":"celebs"};
   buildActionMenu("fuzzbot-video-details-creator-menupopup",
      "Search Rotten Tomatoes", "rotten-tomatoes", serviceArguments, 
      gFuzzbotVideoProcessingData["creator"]["value"]);

   window.sizeToContent();
}
