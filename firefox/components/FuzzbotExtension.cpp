/*
 * Implementation of the FuzzbotExtension.h and IFuzzbotExtension.h
 * headers. This class is the implementation for the XPCOM interfaces
 * which are called via Javascript to control the Fuzzbot components.
 */
#if defined(__linux__)
#include <sys/types.h>
#include <signal.h>
#endif

#include <iostream>
#include <stdio.h>
#include "nsXPCOM.h"
#include "nsCOMPtr.h"
#include "nsIProperties.h"
#include "nsIServiceManager.h"
#include "nsDirectoryServiceDefs.h"
#include "nsIGenericFactory.h"
#include "nsIFile.h"
#include "FuzzbotExtension.h"

using namespace std;

/*
 * Magic Firefox macro that creates a default factory constructor for
 * the Fuzzbot extension.
 */
NS_GENERIC_FACTORY_CONSTRUCTOR(nsFuzzbotExtension)

/*
 * Magic Firefox macro that states that the nsFuzzbotExtension class
 * supports the IDL defined in IFuzzbotExtension.
 */
NS_IMPL_ISUPPORTS1(nsFuzzbotExtension, nsIFuzzbotExtension)

nsFuzzbotExtension::nsFuzzbotExtension()
{
  /* member initializers and constructor code */
}

nsFuzzbotExtension::~nsFuzzbotExtension()
{
  /* destructor code */
}

/* boolean processRdfaTriples(); */
NS_IMETHODIMP nsFuzzbotExtension::ProcessRdfaTriples(PRInt32 *pid, PRBool *_retval)
{
   nsresult rval = NS_ERROR_NOT_IMPLEMENTED;
  
   if(0)
   {
      rval = NS_OK;
      (*_retval) = PR_TRUE;
   }
   else
   {
      rval = NS_ERROR_FAILURE;
      (*_retval) = PR_FALSE;
   }
   
   return rval;
}

/* 
 * All of the Fuzzbot components that are a part of the Fuzzbot
 * extension. This is how the various services are registered in
 * Firefox for the Fuzzbot Extension.
 */
static const nsModuleComponentInfo gFuzzbotComponents[] =
{
   {
      FUZZBOT_CLASSNAME,
      FUZZBOT_CID,
      FUZZBOT_CONTRACTID,
      nsFuzzbotExtensionConstructor
	}
};

// Create the method that will be called to register the extension.
NS_IMPL_NSGETMODULE(nsFuzzbotExtension, gFuzzbotComponents)
