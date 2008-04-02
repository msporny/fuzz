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
   var rval = cdoc.createElement('table');
   _fuzzbotLog("GSD 11");
   rval.setAttribute("id", tableIdString);
   _fuzzbotLog("GSD 12");
   rval.setAttribute("bgcolor", "#c1c1c1");
   _fuzzbotLog("GSD 13");
   rval.style.align = "top";
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
   
   // Title
   var tr = cdoc.createElement('tr');
   var td = cdoc.createElement('td');
   var p = cdoc.createElement('p');
   var br1 = cdoc.createElement('br');
   var center1 = cdoc.createElement('center');
   var text1 = cdoc.createTextNode("Ben Adida");
   var img = cdoc.createElement('img');
   img.setAttribute("src", "http://ben.adida.net/ben.jpg");
   img.width = "200";

   _fuzzbotLog("GSD 4");
   
   center1.appendChild(text1);
   p.appendChild(center1);
   p.appendChild(br1);
   p.appendChild(img);

   td.appendChild(p);
   tr.appendChild(td);
   rval.appendChild(tr);

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
         "chrome://fuzzbot/content/larrow.png");
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
