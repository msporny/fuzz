/**
 * The Fuzzbot extension Javascript functionality for the main Firefox UI.
 *
 * @author Manu Sporny
 */
var gFuzzbotButtonWidth = 44;

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
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function generateSubjectDisplay(elementId, subject)
{
   var cdoc = gBrowser.contentDocument;
   var fuzzbotSubjectButton = cdoc.getElementById(elementId);
   var position = getElementPosition(fuzzbotSubjectButton);
   var tableIdString = elementId + "-table";

   // Create the display table
   var rval = cdoc.createElement('table');
   rval.setAttribute("id", tableIdString);
   rval.setAttribute("bgcolor", "#c1c1c1");
   rval.style.align = "top";
   rval.style.position = "absolute";
   rval.style.top = position[1] + "px";
   rval.style.left = 
      (position[0] + gFuzzbotButtonWidth - 16) + "px";
   rval.style.width = 
      (winWidth - (position[0] + gFuzzbotButtonWidth)) + "px";
   //rval.style.height = 200 + "px";

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
 * Hides the Fuzzbot UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function fuzzbotHideSubject(elementId, subject)
{
   var cdoc = gBrowser.contentDocument;
   var fuzzbotSubjectButton = cdoc.getElementById(elementId);
   var tableId = elementId + "-table"
   var fuzzbotSubjectDisplay = cdoc.getElementById(tableId);

   fuzzbotSubjectDisplay.style.display = "none";

   fuzzbotSubjectButton.setAttribute("onclick",
         "javascript:fuzzbotDisplaySubject('" + elementId + 
         "', '" + subject + "')");
   fuzzbotSubjectButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
}

/**
 * Displays a more complete Fuzzbot UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject string for the triples to fetch from the triple
 *                store.
 */
function fuzzbotDisplaySubject(elementId, subject)
{
   var cdoc = gBrowser.contentDocument;
   var winWidth = cdoc.all ? cdoc.body.clientWidth : window.innerWidth;
   var winHeight = 
      cdoc.all ? cdoc.body.clientHeight : window.innerHeight;
   var fuzzbotSubjectButton = cdoc.getElementById(elementId);
   var horizontalShift = (winWidth/5);

   // move the button to the left
   if(horizontalShift < 200)
   {
      horizontalShift = 200;
   }

   fuzzbotSubjectButton.setAttribute("onclick",
         "javascript:fuzzbotHideSubject('" + elementId + 
         "', '" + subject + "')");
   fuzzbotSubjectButton.style.left = (winWidth - horizontalShift) + "px";

   // display the details panel
   var fuzzbotSubjectDisplay = generateSubjectDisplay(elementId, subject);
   cdoc.body.appendChild(fuzzbotSubjectDisplay);
}

/**
 * Adds Fuzzbot Actions to all of the current elements on the page.
 */
function addFuzzbotMarkup()
{
   var cdoc = gBrowser.contentDocument;
   winWidth = cdoc.all ? cdoc.body.clientWidth : window.innerWidth;
   winHeight = cdoc.all ? cdoc.body.clientHeight : window.innerHeight;
   subjectElements = getAllSubjectElements();

   for(var i = 0; i < subjectElements.length; i++)
   {      
      element = subjectElements[i];
      idString = "fuzzbot-button-" + i;
      subject = cdoc.URL + element.getAttribute('about');
      position = getElementPosition(element);

      
      fuzzbotUiButton = cdoc.createElement('img');
      fuzzbotUiButton.setAttribute("id", idString);
      fuzzbotUiButton.setAttribute("src",
         "chrome://fuzzbot/content/larrow.png");
      fuzzbotUiButton.setAttribute("alt", subject);
      fuzzbotUiButton.setAttribute("title", subject);
      fuzzbotUiButton.setAttribute("onclick", 
         "javascript:fuzzbotDisplaySubject('" + idString + 
         "', '" + subject + "')");
      fuzzbotUiButton.style.position = "absolute";
      fuzzbotUiButton.style.left = (winWidth - gFuzzbotButtonWidth) + "px";
      fuzzbotUiButton.style.top = (position[1] - 8) + "px";
      cdoc.body.appendChild(fuzzbotUiButton);
   }
}
