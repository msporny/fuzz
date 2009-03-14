/**
 * Copyright 2008 Digital Bazaar, Inc.
 */
#ifndef _NS_FUZZ_EXTENSION_H
#define _NS_FUZZ_EXTENSION_H
#include "xpcom-config.h"
#include "nsStringAPI.h"
#include "nsEmbedString.h"
#include "IFuzzExtension.h"

// f5ebc90b-56b5-4bce-96c9-d2962c2af7f5
#define FUZZ_CID {0xf5ebc90b, 0x56b5, 0x4bce, \
   { 0x96, 0xc9, 0xd2, 0x96, 0x2c, 0x2a, 0xf7, 0xf5}}
#define FUZZ_CONTRACTID "@rdfa.digitalbazaar.com/fuzz/xpcom;1"
#define FUZZ_CLASSNAME "Fuzz Extension"

/**
 * The Fuzz Extension class implements the public XPCOM Fuzz
 * Extension interface for the Mozilla class of web browsers.
 *
 * @author Manu Sporny
 */
class nsFuzzExtension : public nsIFuzzExtension
{
public:
   NS_DECL_ISUPPORTS
   NS_DECL_NSIFUZZEXTENSION

   nsFuzzExtension();

private:
   ~nsFuzzExtension();

protected:
   /**
    * Processes any RDFa triples that are included in the given xhtml
    * text.
    * 
    * @param xhtml the XHTML markup that contains the RDFa triples.
    * @return NS_OK on success, NS_ERROR_* on failure.
    */
   nsresult processRdfaTriples(nsString& xhtml);
};

#endif
