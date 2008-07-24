/**
 * The Fuzzbot extension Javascript functionality for the Audio vocabulary.
 *
 * @author Manu Sporny
 */

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
   var subject = event.currentTarget.getAttribute("subject");
   //alert("Display UI for Audio Subject\n: " + subject);

   var params = {inn:{triples:gTripleStore[subject]}, out:null};

   window.openDialog("chrome://fuzzbot/content/displays/audio.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

   event.stopPropagation();
}

/**
 * This callback is called whenever an audio details dialog is loaded.
 */
function initDialog()
{
   var triples = window.arguments[0].inn.triples;

   for(i in triples)
   {
      var triple = triples[i];

      // update the UI based on the title of the audio recording.
      if(triple.predicate == "http://purl.org/dc/elements/1.1/title" ||
         triple.predicate == "http://purl.org/dc/terms/title")
      {
	 var title = document.getElementById("fuzzbot-audio-details-title");
         title.value = triple.object;

         buildActionMenu("fuzzbot-audio-details-title-menupopup",
            "musicbrainz", "track", triple.object);
      }
      // update the UI based on the creator of the audio recording.
      else if(triple.predicate == "http://purl.org/dc/elements/1.1/creator" ||
	      triple.predicate == "http://purl.org/dc/terms/creator")
      {
         var creator = document.getElementById("fuzzbot-audio-details-creator");
         creator.value = triple.object;

         buildActionMenu("fuzzbot-audio-details-creator-menupopup",
            "musicbrainz", "artist", triple.object);
      }
   }
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
