# Configure script for Digital Bazaar Fuzzbot Firefox extension
# Usage: Run ./configure once 
# 
# Author: Manu Sporny

AC_INIT(fuzzbot, 0.7.2, support@digitalbazaar.com)
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

# Make sure the proper libraries exist
AC_CHECK_LIB(expat, main, [], AC_MSG_ERROR(could not find expat library), -L/usr/lib)
AC_CHECK_LIB(rdfa, main, [], AC_MSG_ERROR(could not find rdfa library), -L/usr/lib)

# Set the OS so that we can do certain build modifications if needed
OS="$build_os"

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

# Generating files
AC_OUTPUT(Makefile \
          setup/Makefile.base \
          firefox/Makefile \
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

