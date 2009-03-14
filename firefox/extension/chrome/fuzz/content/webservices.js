/**
 * The webservices module is used to call remote webservices using the
 * JSON serialization protocol and HTTP post. It is a much simpler
 * form of RPC than SOAP or XMLRPC, thus it is easier to understand,
 * implement and debug. 
 */

/**
 * Sends an XML HTTP request to a given URL and calls a given callback
 * with the data.
 *
 * @param url the URL to call
 * @param callback the callback to call with the returned data.
 * @param postData the data to use when posting to the given URL.
 */
function sendJsonRequest(url, callback, callbackData, postData)
{
   var method = (postData) ? "POST" : "GET";
   var req = new XMLHttpRequest();

   if(!req)
   {
      return;
   }

   // open the URL and set the request header
   req.open(method, url, true);
   req.setRequestHeader('User-Agent','XMLHTTP/1.0');
   req.setRequestHeader('Accept', 'application/json');

   // If we're posting data, set the content type to JSON
   if(postData)
   {
      req.setRequestHeader('Content-type','application/json');
   }

   // The on ready request state change function is called whenever
   // the state of the connection is updated. It is used to detect
   // when the data is ready.
   req.onreadystatechange = function()
   {
      if(req.readyState != 4)
      {
         // if the request isn't ready yet, wait until it is.
         return;
      }
      else if(req.readyState == 4)
      {
         if(req.status != 200)
         {
            // if the request failed for some reason, state the reason
            message = "The HTTP status code was " + req.status +
                      ", which means there was a non-fatal error."
            errortype = "webservices.sendJsonRequest";
            convertJsonObject(
               '{"code":0,"message":"' + message + '","type":"' +
               errortype + '"}',
               callback);
         }
         else
         {
            // if the request succeeded and we got a 200 OK, then
            // continue processing
            if(callbackData)
               convertJsonObject(req.responseText, callback, callbackData);
            else
               convertJsonObject(req.responseText, callback);
         }
      }
   }
   // The on error function is called whenever there is a connection
   // error. We still want to execute the callback function if there
   // is an error.
   req.onerror = function()
   {
      // if the request failed for some reason, state the reason
      message = "The HTTP request failed because the server could not " +
                "be contacted.";
      errortype = "webservices.sendJsonRequest";
      convertJsonObject(
         '{"code":0,"message":"' + message + '","type":"' + errortype + '"}',
         callback);
   }
   
   req.send(postData);
}

/**
 * Parses JSON text, creates an object, and calls a callback with the
 * given callback data, if provided.
 *
 * @param jsonText the text encoded in JSON.
 * @param callback the function that should be called once the JSON
 *                 data has been turned into Javascript object form (optional).
 * @param callbackData the data that should be sent to the callback
 *                     function (optional).
 */ 
function convertJsonObject(jsonText, callback, callbackData)
{
   var obj = {};

   try
   {
      obj = JSON.parse(jsonText);
   }
   catch(error)
   {
      obj.code = 0;
      obj.message = "JSON parse error. There was a problem decoding the " +
                    "JSON message that was sent from the server.";
      obj.type = "webservices.convertJsonObject";
   }

   if(callbackData)
   {
      callback(obj, callbackData);
   }
   else
   {
      callback(obj);
   }
}
