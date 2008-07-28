/**
 * The Fuzzbot extension Javascript functionality for the Audio vocabulary.
 *
 * @author Manu Sporny
 */

/**
 * The processing data used for the audio details panel.
 */
gFuzzbotAudioProcessingData = {
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
 * Creates all of the menu items for the Audio AwesomeBar icon menu.
 */
function buildAudioMenuPopup()
{
   var fuzzbotAudioMenu = document.getElementById("fuzzbot-audio-menu-popup");
   var audioSubjects = [];

   // Clear the current contents of the audio menu popup
   while(fuzzbotAudioMenu.firstChild) 
   {
       fuzzbotAudioMenu.removeChild(fuzzbotAudioMenu.firstChild);
   }

   // Scan the triple store and collect the subjects that are audio
   // recordings or albums.
   for(var subject in gTripleStore)
   {
      for(var i in gTripleStore[subject])
      {
         var triple = gTripleStore[subject][i];

         if(triple.predicate == 
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
         {
            if(triple.object == "http://purl.org/media/audio#Recording" ||
               triple.object == "http://purl.org/media/audio#Album")
            {
               audioSubjects.push(triple.subject);
               continue;
            }
            else
            {
               continue;
            }
         }
      }
   }

   // for each subject that is an audio recording or album, add a menu
   // item for it.
   for(var index in audioSubjects)
   {
      var subject = audioSubjects[index];
      for(var i in gTripleStore[subject])
      {
         var triple = gTripleStore[subject][i];

	 if(triple.predicate == "http://purl.org/dc/terms/title" ||
            triple.predicate == "http://purl.org/dc/elements/1.1/title")
	 {
	     var menuItem = createMenuItem(triple.object, audioSelected);
             menuItem.setAttribute("subject", subject);
             fuzzbotAudioMenu.appendChild(menuItem);
         }
      }
   }
}

/**
 * This callback is called whenever an audio item has been selected.
 *
 * @param event the Event object that should be used for processing.
 */
function audioSelected(event)
{
   var subj = event.currentTarget.getAttribute("subject");
   //alert("Display UI for Audio Subject\n: " + subject);

   var params = {inn:{subject:subj, triples:gTripleStore}, out:null};

   window.openDialog("chrome://fuzzbot/content/displays/audio.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

   event.stopPropagation();
}

/**
 * This callback is called whenever an audio details dialog is loaded.
 */
function initDialog()
{
   var args = window.arguments[0].inn;
   var triples = args.triples;
   var subjectTriples = triples[args.subject];
   var images = ["depiction",];
   var labels = ["title", "creator", "contributor", "published",
      "description", "position", "duration", "type"];
   var buttons = ["sample", "download", "license", "payment"];

   // process all of the triples for the given subject and set the appropriate
   // data items in the audio processing model
   for(i in subjectTriples)
   {
      var triple = subjectTriples[i];

      // process every term in the processing model
      for(var term in gFuzzbotAudioProcessingData)
      {
	  _fuzzbotLog("Processing term: " + term);
	 // process every property for every term in the processing model
         for(var p in gFuzzbotAudioProcessingData[term]["properties"])
	 {
	    var property = gFuzzbotAudioProcessingData[term]["properties"][p];
            _fuzzbotLog("Processing property: " + property);
	    if(triple.predicate == property)
	    {
		_fuzzbotLog("SET VALUE: " + triple.object);
   	       gFuzzbotAudioProcessingData[term]["value"] = triple.object;
	    }
	 }
      }
   }

   // set all of the UI elements given the processing model
   for(var term in gFuzzbotAudioProcessingData)
   {
       _fuzzbotLog("Searching for " + term);
      var tval = gFuzzbotAudioProcessingData[term]["value"];
      var widget = document.getElementById("fuzzbot-audio-details-" + term);

      // select which UI elements to modify based on the name of the attribute
      if(tval != null)
      {
	  if(labels.indexOf(term) >= 0)
	  {
	     _fuzzbotLog("widget " + widget + " value " + 
	        gFuzzbotAudioProcessingData[term]["value"]);
	     widget.value = tval;
	  }
	  else if(buttons.indexOf(term) >= 0)
	  {
	     var button = 
		 document.getElementById("fuzzbot-audio-details-" + term + 
		    "-button");
             button.setAttribute("href", tval);
	     button.addEventListener("click", openUrlInNewTab, false);
	     widget.value = tval;
	  }
	  else if(images.indexOf(term) >= 0)
	  {
	     widget.src = tval;
	  }
      }
      else
      {
          var row = 
             document.getElementById("fuzzbot-audio-details-row-" + term);
	  row.hidden = true;
      }
   }

   // build the action menus
   buildActionMenu("fuzzbot-audio-details-title-menupopup",
      "musicbrainz", "track", 
      gFuzzbotAudioProcessingData["title"]["value"]);
   buildActionMenu("fuzzbot-audio-details-creator-menupopup",
      "musicbrainz", "artist", 
      gFuzzbotAudioProcessingData["creator"]["value"]);
   buildActionMenu("fuzzbot-audio-details-contributor-menupopup",
      "musicbrainz", "label", 
      gFuzzbotAudioProcessingData["contributor"]["value"]);
}

/**
 * Builds an action menu given the input text for the action and the ID
 * of the menupopup.
 *
 * @param id The ID for the menupopup.
 * @param service the service to query.
 * @param serviceType The type of the service to query.
 * @param query the query to use when checking the service.
 */
function buildActionMenu(id, service, serviceType, query)
{
   var actionMenu = document.getElementById(id);

   // Clear the current contents of the action menu
   while(actionMenu.firstChild)
   {
      actionMenu.removeChild(actionMenu.firstChild);
   }
   
   // Create the MusicBrainz search menuitem
   var menuItem = createMenuItem("Search MusicBrainz", performSearch);
   menuItem.setAttribute("service", service);
   menuItem.setAttribute("serviceType", serviceType);
   menuItem.setAttribute("query", query);
   actionMenu.appendChild(menuItem);
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