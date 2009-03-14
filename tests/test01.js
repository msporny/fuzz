var gFuzzButtonWidth = 44;

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
   var subjectElements = new Array();
   var element;
   var i = 0;

   while(element = document.getElementsByTagName ('*')[i++])
   {
      if(element.hasAttributes())
      {
         if(element.attributes['about'])
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
   var fuzzSubjectButton = document.getElementById(elementId);
   var position = getElementPosition(fuzzSubjectButton);
   var tableIdString = elementId + "-table";

   // Create the display table
   var rval = document.createElement('table');
   rval.setAttribute("id", tableIdString);
   rval.setAttribute("bgcolor", "#c1c1c1");
   rval.style.align = "top";
   rval.style.position = "absolute";
   rval.style.top = position[1] + "px";
   rval.style.left = 
      (position[0] + gFuzzButtonWidth - 16) + "px";
   rval.style.width = 
      (winWidth - (position[0] + gFuzzButtonWidth)) + "px";
   //rval.style.height = 200 + "px";

   // Title
   var tr = document.createElement('tr');
   var td = document.createElement('td');
   var p = document.createElement('p');
   var br1 = document.createElement('br');
   var center1 = document.createElement('center');
   var text1 = document.createTextNode("Ben Adida");
   var img = document.createElement('img');
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
 * Hides the Fuzz UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject that is associated with the element.
 */
function fuzzHideSubject(elementId, subject)
{
   var fuzzSubjectButton = document.getElementById(elementId);
   var tableId = elementId + "-table"
   var fuzzSubjectDisplay = document.getElementById(tableId);

   fuzzSubjectDisplay.style.display = "none";

   fuzzSubjectButton.setAttribute("onclick",
         "javascript:fuzzDisplaySubject('" + elementId + 
         "', '" + subject + "')");
   fuzzSubjectButton.style.left = (winWidth - gFuzzButtonWidth) + "px";
}

/**
 * Displays a more complete Fuzz UI for a given subject.
 *
 * @param elementId The ID of the element to use when manipulating the screen.
 * @param subject the subject string for the triples to fetch from the triple
 *                store.
 */
function fuzzDisplaySubject(elementId, subject)
{
   var winWidth = document.all ? document.body.clientWidth : window.innerWidth;
   var winHeight = 
      document.all ? document.body.clientHeight : window.innerHeight;
   var fuzzSubjectButton = document.getElementById(elementId);
   var horizontalShift = (winWidth/5);

   // move the button to the left
   if(horizontalShift < 200)
   {
      horizontalShift = 200;
   }

   fuzzSubjectButton.setAttribute("onclick",
         "javascript:fuzzHideSubject('" + elementId + 
         "', '" + subject + "')");
   fuzzSubjectButton.style.left = (winWidth - horizontalShift) + "px";

   // display the details panel
   var fuzzSubjectDisplay = generateSubjectDisplay(elementId, subject);
   document.body.appendChild(fuzzSubjectDisplay);
}

/**
 * Adds Fuzz Actions to all of the current elements on the page.
 */
function addFuzzMarkup()
{
   winWidth = document.all ? document.body.clientWidth : window.innerWidth;
   winHeight = document.all ? document.body.clientHeight : window.innerHeight;
   subjectElements = getAllSubjectElements();
 
   text = ""
  
   for(var i = 0; i < subjectElements.length; i++)
   {
      element = subjectElements[i];
      idString = "fuzz-button-" + i;
      subject = document.URL + element.attributes['about'].value;
      position = getElementPosition(element);

      fuzzUiButton = document.createElement('img');
      fuzzUiButton.setAttribute("id", idString);
      fuzzUiButton.setAttribute("src", "larrow.png");
      fuzzUiButton.setAttribute("alt", subject);
      fuzzUiButton.setAttribute("title", subject);
      fuzzUiButton.setAttribute("onclick", 
         "javascript:fuzzDisplaySubject('" + idString + 
         "', '" + subject + "')");
      fuzzUiButton.style.position = "absolute";
      fuzzUiButton.style.left = (winWidth - gFuzzButtonWidth) + "px";
      fuzzUiButton.style.top = (position[1] - 8) + "px";
      document.body.appendChild(fuzzUiButton);

      text += element.attributes['about'].value + "<br />";
      text += "xpos:" + position[0] + "<br />";
      text += "ypos:" + position[1] + "<br />";
   }

   //document.write(text);
}
