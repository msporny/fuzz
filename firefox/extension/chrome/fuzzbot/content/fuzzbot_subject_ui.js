/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */
var gFuzzbotButtonWidth = 12;

/**
 * Gets the absolute X and Y position of an element on the page.
 *
 * @return an array containing an [X, Y] position of the given element
 */
function getElementPosition(element)
{
	var curleft = 0;
   var curtop = 0;

   if(element.offsetParent)
   {
      do 
      {
         curleft += element.offsetLeft;
         curtop += element.offsetTop;
		}
      while(element = element.offsetParent);
   }

	return [curleft, curtop];
}

/**
 * Gets all of the subject elements in the current document.
 */
function getAllSubjectElements()
{
   var cdoc = gBrowser.contentDocument;
   var subjectElements = new Array();
   var element;
   var i = 0;
   
   while(element = cdoc.getElementsByTagName('*')[i++])
   {
      if(element.hasAttributes())
      {
         if(element.getAttribute('about'))
         {
            subjectElements.push(element);
         }
      }
   }

   return subjectElements;
}

/**
 * Generates the subject display given an element and a subject.
 *
 * @param element The element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function generateSubjectDisplay(element, subject)
{
   _fuzzbotLog("GSD!");
   
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var fuzzbotSubjectButton = element;
   var position = getElementPosition(fuzzbotSubjectButton);
   var tableIdString = element.getAttribute('id') + "-table";

   _fuzzbotLog("GSD TIS: " + tableIdString);
   
   // Create the display table
   var rval = cdoc.createElement('div');
   _fuzzbotLog("GSD 11");
   rval.setAttribute("id", tableIdString);
   _fuzzbotLog("GSD 12");
   rval.style.background = "#dcdad5";
   _fuzzbotLog("GSD 13");
   rval.style.position = "absolute";
   rval.style.top = position[1] + "px";
   _fuzzbotLog("GSD 14");
   rval.style.left = 
      (position[0] + gFuzzbotButtonWidth + 16) + "px";
   _fuzzbotLog("GSD 15");
   rval.style.width = 
      (winWidth - (position[0] + gFuzzbotButtonWidth)) + "px";
   _fuzzbotLog("GSD 16");
   
   //rval.style.height = 200 + "px";

   _fuzzbotLog("GSD 3");

   _fuzzbotLog("TripleStore: " + gTripleStore);

   var name = 0;
   var depiction = 0;
   var type = 0;
   var dctitle = 0;
   var dcabstract = 0;
   for(var i in gTripleStore[subject])
   {
      var triple = gTripleStore[subject][i];
      
      _fuzzbotLog("triple: " + triple);
      _fuzzbotLog(subject + ": " + triple.predicate + " " + triple.object);
      
      if(triple.predicate == "http://xmlns.com/foaf/0.1/name")
      {
         name = triple.object;
      }
      if(triple.predicate == "http://xmlns.com/foaf/0.1/depiction")
      {
         depiction = triple.object;
      }
      if((triple.predicate ==
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"))
      {
         type = triple.object;
      }
      if(triple.predicate == "http://purl.org/dc/elements/1.1/title")
      {
         dctitle = triple.object;
      }
      if(triple.predicate == "http://purl.org/dc/terms/abstract")
      {
         dcabstract = triple.object;
      }
   }

   // Display the title
   var h1 = cdoc.createElement('h1');
   h1.style.fontWeight = "bold";
   h1.style.margin = 0;
   h1.style.textAlign = "center";
   h1.style.padding = "5px";
   h1.style.fontSize = "16px";
   h1.style.backgroundImage = "url(chrome://fuzzbot/content/tabpanel-top.png)";
   h1.style.backgroundPosition = "top";
   h1.style.backgroundRepeat = "repeat-x";

   var h1text = cdoc.createTextNode("Unknown");
   if(name)
   {
      h1text = cdoc.createTextNode(name);
   }
   else if(dctitle)
   {
      h1text = cdoc.createTextNode(dctitle);
   }
   h1.appendChild(h1text);
   rval.appendChild(h1);

   // Display the image if it exists
   if(depiction)
   {
      var imgdiv = cdoc.createElement('div');
      imgdiv.style.textAlign = "center";
      imgdiv.style.backgroundImage =
         "url(chrome://fuzzbot/content/tabpanel-middle.png)";
      imgdiv.style.backgroundPosition = "left";
      imgdiv.style.backgroundRepeat = "repeat-y";
   
      var img = cdoc.createElement('img');
      img.width = "200";
      img.setAttribute("src", depiction);
      img.style.marginLeft = "auto";
      img.style.marginRight = "auto";
      
      imgdiv.appendChild(img);
      rval.appendChild(imgdiv);
   }
   
   // Display the main body of the tab
   var divbody = cdoc.createElement('div');
   divbody.style.padding = "0 10px";
   divbody.style.backgroundImage =
      "url(chrome://fuzzbot/content/tabpanel-middle.png)";
   divbody.style.backgroundPosition = "left";
   divbody.style.backgroundRepeat = "repeat-y";
   rval.appendChild(divbody);

   if(type == "http://xmlns.com/foaf/0.1/Person")
   {
      _fuzzbotLog("DDC 1");
      
      // Display the actions available via this tab
      var form = cdoc.createElement('form');
      var select = cdoc.createElement('select');
      var homepage_option = cdoc.createElement('option');
      var email_option = cdoc.createElement('option');
      var skype_option = cdoc.createElement('option');
      var vcard_export_option = cdoc.createElement('option');

      _fuzzbotLog("DDC 2");
      
      form.style.textAlign = "center";
      form.style.padding = "5px 0";
      homepage_option.setAttribute("disabled", true);
      homepage_option.setAttribute("selected", true);
      _fuzzbotLog("DDC 21");
      homepage_option.appendChild(cdoc.createTextNode("Go to Homepage"));
      _fuzzbotLog("DDC 22");
      email_option.setAttribute("disabled", true);
      email_option.appendChild(cdoc.createTextNode("E-mail"));
      skype_option.setAttribute("disabled", true);
      skype_option.appendChild(cdoc.createTextNode("Call via Skype"));
      vcard_export_option.setAttribute("disabled", true);
      vcard_export_option.appendChild(
         cdoc.createTextNode("Add to Addressbook"));

      _fuzzbotLog("DDC 3");
      
      select.appendChild(homepage_option);
      select.appendChild(email_option);
      select.appendChild(skype_option);
      select.appendChild(vcard_export_option);
      form.appendChild(select);
      divbody.appendChild(form);

      _fuzzbotLog("DDC 4");
   }

   // display an abstract if needed
   if(dcabstract)
   {
      var p = cdoc.createElement('p');
      p.innerHTML = dcabstract;
      divbody.appendChild(p);
   }
   
   // Display the bottom of the tab
   var divbottom = cdoc.createElement('div');
   divbottom.style.height = "2px";
   divbottom.style.backgroundImage =
      "url(chrome://fuzzbot/content/tabpanel-bottom.png)";
   divbottom.style.backgroundPosition = "bottom";
   divbottom.style.backgroundRepeat = "repeat-x";
   rval.appendChild(divbottom);

   _fuzzbotLog("GSD 4");

   return rval;
}

/**
 * Handles a click event in the DOM.
 *
 * @param event The click event that occurred in the DOM.
 */
function fuzzbotHandleClickEvent(event)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var element = event.target;
   var subject = element.getAttribute('title');
   var position = getElementPosition(element);

   _fuzzbotLog("X,Y: "+ position[0] + ", " + position[1]);

   if((winWidth - position[0]) < 100)
   {
      fuzzbotDisplaySubject(element, subject);
   }
   else
   {
      fuzzbotHideSubject(element, subject);
   }
}

/**
 * Hides the Fuzzbot UI for a given subject.
 *
 * @param element The element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function fuzzbotHideSubject(element, subject)
{
   _fuzzbotLog("FHS 1");
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var fuzzbotSubjectButton = element;
   _fuzzbotLog("FHS 2");
   var tableId = element.getAttribute('id') + "-table";
   var fuzzbotSubjectDisplay = cdoc.getElementById(tableId);
   _fuzzbotLog("FHS 3");

   //fuzzbotSubjectDisplay.style.display = "none";
   _fuzzbotLog("FHS 4");

   cdoc.body.removeChild(fuzzbotSubjectDisplay);
   
   _fuzzbotLog("FHS 4.5");
   fuzzbotSubjectButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
   _fuzzbotLog("FHS 5");
}

/**
 * Displays a more complete Fuzzbot UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject string for the triples to fetch from the triple
 *                store.
 */
function fuzzbotDisplaySubject(element, subject)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var winHeight = cdoc.body.clientHeight;
   var fuzzbotSubjectButton = element;
   var horizontalShift = (winWidth / 5);

   // move the button to the left
   if(horizontalShift < 200)
   {
      horizontalShift = 200;
   }
   fuzzbotSubjectButton.style.left = (winWidth - horizontalShift) + "px";

   // display the details panel
   var fuzzbotSubjectDisplay = generateSubjectDisplay(element, subject);
   cdoc.body.appendChild(fuzzbotSubjectDisplay);
}

   
/**
 * Adds Fuzzbot Actions to all of the current elements on the page.
 */
function addFuzzbotMarkup()
{
   _fuzzbotLog("AFM!");
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.body.clientWidth;
   var winHeight = cdoc.body.clientHeight;
   var subjectElements = getAllSubjectElements();
   _fuzzbotLog("WW: " + winWidth);

   for(var i = 0; i < subjectElements.length; i++)
   {
      _fuzzbotLog("AFM: " + i);
  
      var element = subjectElements[i];
      _fuzzbotLog("AFM: " + i);
      var idString = "fuzzbot-button-" + i;
      var subject = cdoc.URL + element.getAttribute('about');
      _fuzzbotLog("1");
      var position = getElementPosition(element);
      _fuzzbotLog("2");
      
      var fuzzbotUiButton = cdoc.createElement('img');
      _fuzzbotLog("3");
      fuzzbotUiButton.setAttribute("id", idString);
      fuzzbotUiButton.setAttribute("src",
         "chrome://fuzzbot/content/ltab_open.png");
      fuzzbotUiButton.setAttribute("alt", subject);
      fuzzbotUiButton.setAttribute("title", subject);

      _fuzzbotLog("4");
      fuzzbotUiButton.addEventListener(
         "click", fuzzbotHandleClickEvent, false);
      _fuzzbotLog("5");
      
      fuzzbotUiButton.style.position = "absolute";
      _fuzzbotLog("6");
      fuzzbotUiButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
      _fuzzbotLog("7");
      fuzzbotUiButton.style.top = (position[1] - 8) + "px";
      _fuzzbotLog("8");
      cdoc.body.appendChild(fuzzbotUiButton);
      _fuzzbotLog("9");
   }
}

/**
 * Removes all Fuzzbot UI elements from the page.
 */
function removeFuzzbotMarkup()
{
   var cdoc = gBrowser.contentDocument;
   var elementFound = false;
   var i = 0;

   do
   {
      var idString = "fuzzbot-button-" + i;
      var fuzzbotUiButton = cdoc.getElementById(idString);

      _fuzzbotLog("FB: " + fuzzbotUiButton);

      if(fuzzbotUiButton)
      {
         elementFound = true;
         cdoc.body.removeChild(fuzzbotUiButton);
      }
      else
      {
         elementFound = false;
      }
      i++;
   }
   while(elementFound);
}
