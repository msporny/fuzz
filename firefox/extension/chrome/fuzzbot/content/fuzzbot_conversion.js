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
   var rval = "$0";

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

   return rval;
}
