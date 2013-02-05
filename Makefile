build: boosh components

boosh:
	node make/build.js

components:
	@echo '{' > component.json
	@egrep '(name|description|version|keywords)' package.json >> component.json
	@echo '  , "main":     "bean.js"' >> component.json
	@echo '  , "scripts": ["bean.js"]' >> component.json
	@echo '  , "repo": "https://github.com/fat/bean"' >> component.json
	@echo '}' >> component.json
	component build
