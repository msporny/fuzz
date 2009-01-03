# Configure script for Digital Bazaar Fuzzbot Firefox extension
# Usage: Run ./configure once 
# 
# Author: Manu Sporny

AC_INIT(fuzzbot, 0.8.4, support@digitalbazaar.com)
AC_CONFIG_AUX_DIR(setup)

# Setup standard build environment variables
FUZZBOTDIR=`pwd`
RELEASE=`date +%Y%m%d`

# Check for particular build options
AC_ARG_ENABLE([linux],
   AS_HELP_STRING([--enable-linux], [compile for linux [[yes]]]),
   [
      case "${enableval}" in
         yes) BUILD_FOR_LINUX=yes ;;
         no) BUILD_FOR_LINUX=no ;;
         *) AC_MSG_ERROR(bad value ${enableval} for --enable-linux) ;;
      esac
   ], [BUILD_FOR_LINUX=yes])  dnl Default value

AC_ARG_ENABLE([windows],
   AS_HELP_STRING([--enable-windows], [compile for windows [[no]]]),
   [
      case "${enableval}" in
         yes) BUILD_FOR_WINDOWS=yes ;;
         no) BUILD_FOR_WINDOWS=no ;;
         *) AC_MSG_ERROR(bad value ${enableval} for --enable-windows) ;;
      esac
   ], [BUILD_FOR_WINDOWS=no])  dnl Default value

AC_ARG_ENABLE([macos],
   AS_HELP_STRING([--enable-macos], [compile for MacOS [[no]]]),
   [
      case "${enableval}" in
         yes) BUILD_FOR_MACOS=yes ;;
         no) BUILD_FOR_MACOS=no ;;
         *) AC_MSG_ERROR(bad value ${enableval} for --enable-macos) ;;
      esac
   ], [BUILD_FOR_MACOS=no])  dnl Default value

echo -e "\n--------- Configuring Fuzzbot build environment -----------"

# Check the system type
AC_CANONICAL_BUILD()
AC_CANONICAL_HOST()
AC_CANONICAL_SYSTEM()

# Checking for standard build tools
AC_PROG_INSTALL()

# Conditional setup for Windows build
if test "$BUILD_FOR_WINDOWS" = "yes" ; then
   BUILD_FOR_LINUX="no"
   BUILD_FOR_MACOS="no"
   AC_CHECK_PROGS(CXX, i586-mingw32msvc-g++ g++, not found)
   AC_CHECK_PROGS(AR, i586-mingw32msvc-ar ar, not found)
   AC_CHECK_PROGS(AS, i586-mingw32msvc-as as, not found)
   AC_CHECK_PROGS(XPIDL, xpidl, not found)
   FIREFOX_PLATFORM="WINNT_x86-msvc"
   OS="mingw32"
fi

# Conditional setup for MacOS build
if test "$BUILD_FOR_MACOS" = "yes" ; then
   BUILD_FOR_LINUX="no"
   BUILD_FOR_WINDOWS="no"
   AC_PROG_CXX()
   AC_CHECK_PROG(AR, ar, ar, not found)
   AC_CHECK_PROG(AS, as, as, not found)
   AC_CHECK_PROGS(XPIDL, /usr/local/gecko-sdk/bin/xpidl xpidl, not found)
   FIREFOX_PLATFORM="Darwin_ppc-gcc3"
   OS="macos"
fi

# Conditional setup for Linux build
if test "$BUILD_FOR_LINUX" = "yes" ; then
   AC_LANG(C++)
   AC_PROG_CXX()
   AC_CHECK_PROG(AR, ar, ar, not found)
   AC_CHECK_PROG(AS, as, as, not found)
   AC_CHECK_PROGS(XPIDL, xpidl, not found)
   FIREFOX_PLATFORM="Linux_x86-gcc3"
   OS="$build_os"
fi

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

# Make all the proper substitutions
AC_SUBST(FUZZBOTDIR)

# Make all the proper substitutions
VERSION="$PACKAGE_VERSION"
AC_SUBST(VERSION)
AC_SUBST(RELEASE)

AC_SUBST(CXX)
AC_SUBST(AR)
AC_SUBST(AS)

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
echo "C++ compiler   : $CXX"
echo "Archiver       : $AR"
echo "xpidl          : $XPIDL"

