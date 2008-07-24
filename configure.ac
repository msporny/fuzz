# Configure script for Digital Bazaar Fuzzbot Firefox extension
# Usage: Run ./configure once 
# 
# Author: Manu Sporny

AC_INIT(fuzzbot, 0.8.3, support@digitalbazaar.com)
AC_CONFIG_AUX_DIR(setup)

# Setup standard build environment variables
FUZZBOTDIR=`pwd`
RELEASE=`date +%Y%m%d`

echo -e "\n--------- Configuring Fuzzbot build environment -----------"

# Check the system type
AC_CANONICAL_BUILD()

# Checking for standard build tools
#AC_LANG(C++)
AC_PROG_INSTALL()

# Get the C compiler for this system
AC_PROG_CXX()
AC_CHECK_PROG(AR, ar, ar, not found)
AC_CHECK_PROG(AS, as, as, not found)
AC_CHECK_PROG(DLLWRAP, dllwrap, dllwrap, not found)

CC="$CXX"

# Perform compilation environment tests
#AC_CHECK_HEADERS(iostream)
RDFA_LIB_DIRECTORY="/usr/lib"
RDFA_INCLUDE_DIRECTORY="/usr/include"
TIDY_LIB_DIRECTORY="/usr/lib"
TIDY_INCLUDE_DIRECTORY="/usr/include"
EXPAT_LIB_DIRECTORY="/usr/lib"
EXPAT_INCLUDE_DIRECTORY="/usr/include"

# Check to see where the expat library resides
if test -e "/opt/local/lib/libexpat.dylib"; then
   EXPAT_INCLUDE_DIRECTORY="/opt/local/include"
   EXPAT_LIB_DIRECTORY="/opt/local/lib"
fi

# Check to see where the tidy library resides
if test -e "/opt/local/lib/libtidy.a"; then
   TIDY_INCLUDE_DIRECTORY="/opt/local/include"
   TIDY_LIB_DIRECTORY="/opt/local/lib"
fi

# Check to see where the rdfa parser resides
if test -e "../librdfa/libs/librdfa.so"; then
   RDFA_INCLUDE_DIRECTORY="$FUZZBOTDIR/../librdfa/c"
   RDFA_LIB_DIRECTORY="$FUZZBOTDIR/../librdfa/libs"
fi
if test -e "../librdfa/libs/librdfa.dylib"; then
   RDFA_INCLUDE_DIRECTORY="$FUZZBOTDIR/../librdfa/c"
   RDFA_LIB_DIRECTORY="$FUZZBOTDIR/../librdfa/libs"
fi

# Make sure the proper libraries exist
AC_CHECK_LIB(expat, main, [], AC_MSG_ERROR(could not find expat library), -L$EXPAT_LIB_DIRECTORY)
AC_CHECK_LIB(tidy, main, [], AC_MSG_ERROR(could not find tidy library), -L$TIDY_LIB_DIRECTORY -L$EXPAT_LIB_DIRECTORY)
AC_CHECK_LIB(rdfa, main, [], AC_MSG_ERROR(could not find rdfa library), -L$RDFA_LIB_DIRECTORY -L$TIDY_LIB_DIRECTORY -L$EXPAT_LIB_DIRECTORY)

# Set the OS so that we can do certain build modifications if needed
OS="$build_os"

if test "$build_os" = "linux-gnu"; then
   FIREFOX_PLATFORM="Linux_x86-gcc3"
fi
if test "$build_os" = "mingw32"; then
   FIREFOX_PLATFORM="WINNT_x86-msvc"
fi
if test "$build_os" = "darwin"; then
   FIREFOX_PLATFORM="Darwin_ppc-gcc3"
fi

# Make all the proper substitutions
AC_SUBST(FUZZBOTDIR)

# Make all the proper substitutions
VERSION="$PACKAGE_VERSION"
AC_SUBST(VERSION)
AC_SUBST(RELEASE)

AC_SUBST(CC)
AC_SUBST(AR)
AC_SUBST(AS)
AC_SUBST(DLLWRAP)

AC_SUBST(OS)
AC_SUBST(FIREFOX_PLATFORM)

# Export the proper include/library build paths
AC_SUBST(RDFA_LIB_DIRECTORY)
AC_SUBST(RDFA_INCLUDE_DIRECTORY)
AC_SUBST(TIDY_LIB_DIRECTORY)
AC_SUBST(TIDY_INCLUDE_DIRECTORY)
AC_SUBST(EXPAT_LIB_DIRECTORY)
AC_SUBST(EXPAT_INCLUDE_DIRECTORY)

# Generating files
AC_OUTPUT(Makefile \
          setup/Makefile.base \
          docs/Makefile \
          firefox/Makefile \
          firefox/extension/install.rdf \
	  firefox/components/Makefile)

# Dump the build configuration for the developer
echo -e "\n--------- Fuzzbot build environment -----------"
echo "Product        : $PACKAGE_STRING-$RELEASE"
echo "Build system   : $build_cpu-$build_vendor-$build_os"
echo "C++ compiler   : $CC"
echo "Archiver       : $AR"
if test "$DLLWRAP" != "not found"; then
   echo "DLL wrapper    : $DLLWRAP"
fi

