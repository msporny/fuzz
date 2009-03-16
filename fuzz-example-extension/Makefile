NAME=fuzz-example
RM=rm
RM_FLAGS=-rf
ZIPEXCLUDE=-x \*.swp -x \*.svn/\* -x \*~ \*.svg

.PHONY: xpi clean

xpi:
	echo "Building Fuzz Extension Example XPI..."
	mkdir -p dist
	-$(RM) extension/chrome/$(NAME).jar
	cd extension/chrome/$(NAME) && \
		zip -q -r ../$(NAME).jar content locale $(ZIPEXCLUDE)
	cd extension && \
	zip -q ../dist/fuzz-example.xpi chrome.manifest chrome/$(NAME).jar \
		defaults/preferences/fuzz-example.js \
		install.rdf \
		$(ZIPEXCLUDE)

clean:
	@$(RM) $(RMFLAGS) dist
	@$(RM) $(RMFLAGS) extension/chrome/$(NAME).jar
