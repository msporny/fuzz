/**
 * The Fuzzbot extension Javascript functionality for converting values into
 * displayable strings.
 *
 * @author Manu Sporny
 */

/**
 * Converts a set of triples of type http://purl.org/commerce#Price to 
 * a human-readable string.
 *
 * @param triples An array of triples containing at least a currency and
 *                amount.
 *
 * @return A human-readable string.
 */
function convertPriceToString(triples)
{
   var currency = "$";
   var amount = "0";
   var rval = "$0";

   for(i in triples)
   {
       var triple = triples[i];

       if(triple.predicate ==
          "http://purl.org/commerce#currency")
       {
	  // retrieve the currency from the triples
	  currency = triple.object;
	  
	  if(currency == "USD")
	  {
	     currency = "(USD) $";
	  }
       }
       else if(triple.predicate ==
          "http://purl.org/commerce#amount")
       {
	  // retrieve the monetary amount from the triples.
	  amount = triple.object;
       }
   }
   rval = currency + " " + amount;

   return rval;
}

/**
 * Converts an ISO-8601 Duration string to a human-readable string.
 *
 * @param iso8601Duration An ISO-8601 duration string.
 *
 * @return A human-readable string.
 */
function convertIso8601DurationToString(iso8601Duration)
{
   var rval = "0 minutes";

   if(iso8601Duration != null)
   {
       rval = iso8601Duration.replace(/PT/, "").replace(/H/, 
          " hours ").replace(/M/, " minutes ").replace(/S/, " seconds");
   }

   return rval;
}
