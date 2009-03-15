# Configure script for Digital Bazaar Fuzz Firefox extension
# Usage: Run ./configure once 
# 
# Author: Manu Sporny

AC_INIT(fuzz, 0.9, support@digitalbazaar.com)
AC_CONFIG_AUX_DIR(setup)

# Setup standard build environment variables
FUZZDIR=`pwd`
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

echo -e "\n--------- Configuring Fuzz build environment -----------"

# Check the system type
AC_CANONICAL_BUILD()
AC_CANONICAL_HOST()
AC_CANONICAL_SYSTEM()
AC_LANG(C++)

# Checking for standard build tools
AC_PROG_INSTALL()

# Check to see where the expat library resides
if test -e "/opt/local/lib/libexpat.dylib"; then
   EXPAT_INCLUDE_DIRECTORY="/opt/local/include"
   EXPAT_LIB_DIRECTORY="/opt/local/lib"
fi
if test -e "/usr/lib/libexpat.a"; then
   EXPAT_INCLUDE_DIRECTORY="/usr/include"
   EXPAT_LIB_DIRECTORY="/usr/lib"
fi

# Check to see where the tidy library resides
if test -e "/opt/local/lib/libtidy.a"; then
   TIDY_INCLUDE_DIRECTORY="/opt/local/include"
   TIDY_LIB_DIRECTORY="/opt/local/lib"
fi
if test -e "/usr/lib/libtidy.a"; then
   TIDY_INCLUDE_DIRECTORY="/usr/include"
   TIDY_LIB_DIRECTORY="/usr/lib"
fi

# Check to see where the rdfa parser resides
if test -e "../librdfa/libs/librdfa.so"; then
   RDFA_INCLUDE_DIRECTORY="$FUZZDIR/../librdfa/c"
   RDFA_LIB_DIRECTORY="$FUZZDIR/../librdfa/libs"
fi
if test -e "../librdfa/libs/librdfa.dylib"; then
   RDFA_INCLUDE_DIRECTORY="$FUZZDIR/../librdfa/c"
   RDFA_LIB_DIRECTORY="$FUZZDIR/../librdfa/libs"
fi
if test -e "../librdfa/libs/rdfa.dll"; then
   RDFA_INCLUDE_DIRECTORY="$FUZZDIR/../librdfa/c"
   RDFA_LIB_DIRECTORY="$FUZZDIR/../librdfa/libs"
fi

# Conditional setup for Windows build
if test "$BUILD_FOR_WINDOWS" = "yes" ; then
   BUILD_FOR_LINUX="no"
   BUILD_FOR_MACOS="no"
   AC_CHECK_PROGS(CXX, i586-mingw32msvc-g++ g++, not found)
   AC_CHECK_PROGS(AR, i586-mingw32msvc-ar ar, not found)
   AC_CHECK_PROGS(AS, i586-mingw32msvc-as as, not found)
   AC_CHECK_PROGS(XPIDL, xpidl, not found)
   FIREFOX_PLATFORM="WINNT_x86-msvc"
   TIDY_LIB_DIRECTORY="$FUZZDIR/3rdparty/tidy"
   TIDY_INCLUDE_DIRECTORY="$FUZZDIR/3rdparty/tidy/include"
   EXPAT_LIB_DIRECTORY="$FUZZDIR/3rdparty/expat"
   EXPAT_INCLUDE_DIRECTORY="$FUZZDIR/3rdparty/expat/include"
   XULRUNNER_LIB_DIRECTORY="$FUZZDIR/../gecko-sdk/lib"
   XULRUNNER_INCLUDE_DIRECTORY="$FUZZDIR/../gecko-sdk/include"
   XULRUNNER_IDL_DIRECTORY="$FUZZDIR/../gecko-sdk/idl"
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
   FIREFOX_PLATFORM="Darwin_x86-gcc3"
   XULRUNNER_LIB_DIRECTORY=/usr/local/gecko-sdk/lib
   XULRUNNER_INCLUDE_DIRECTORY=/usr/local/gecko-sdk/include
   XULRUNNER_IDL_DIRECTORY=/usr/local/gecko-sdk/idl
   OS="macos"
fi

# Conditional setup for Linux build
if test "$BUILD_FOR_LINUX" = "yes" ; then
   AC_PROG_CXX()
   AC_CHECK_PROG(AR, ar, ar, not found)
   AC_CHECK_PROG(AS, as, as, not found)
   AC_CHECK_PROGS(XPIDL, xpidl, not found)
   FIREFOX_PLATFORM="Linux_x86-gcc3"
   XULRUNNER_LIB_DIRECTORY=/usr/lib/xulrunner-devel-1.9/sdk/lib
   XULRUNNER_INCLUDE_DIRECTORY=/usr/include/xulrunner-1.9/stable
   XULRUNNER_IDL_DIRECTORY=/usr/share/idl/xulrunner-1.9/stable
   OS="linux"
fi

# Perform compilation environment tests
#AC_CHECK_HEADERS(iostream)

# Make sure the proper libraries exist
if test "$BUILD_FOR_WINDOWS" = "no" ; then
AC_CHECK_LIB(expat, main, [], AC_MSG_ERROR(could not find expat library), -L$EXPAT_LIB_DIRECTORY)
AC_CHECK_LIB(tidy, main, [], AC_MSG_ERROR(could not find tidy library), -L$TIDY_LIB_DIRECTORY -L$EXPAT_LIB_DIRECTORY)
AC_CHECK_LIB(rdfa, main, [], AC_MSG_ERROR(could not find rdfa library), -L$RDFA_LIB_DIRECTORY -L$TIDY_LIB_DIRECTORY -L$EXPAT_LIB_DIRECTORY)
fi

# Make all the proper substitutions
VERSION="$PACKAGE_VERSION"
AC_SUBST(FUZZDIR)
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
AC_SUBST(XULRUNNER_LIB_DIRECTORY)
AC_SUBST(XULRUNNER_INCLUDE_DIRECTORY)
AC_SUBST(XULRUNNER_IDL_DIRECTORY)

# Generating files
AC_OUTPUT(Makefile \
          setup/Makefile.base \
          fuzz-addon/Makefile \
          fuzz-addon/extension/install.rdf \
	  fuzz-addon/components/Makefile)

# Dump the build configuration for the developer
echo -e "\n--------- Fuzz build environment -----------"
echo "Product        : $PACKAGE_STRING-$RELEASE"
echo "Build system   : $build_cpu-$build_vendor-$build_os"
echo "C++ compiler   : $CXX"
echo "Archiver       : $AR"
echo "xpidl          : $XPIDL"

