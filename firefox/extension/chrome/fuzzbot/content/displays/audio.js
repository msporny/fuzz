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
   alert("Display UI for Audio Subject\n: " + subject);
   event.stopPropagation();
}
