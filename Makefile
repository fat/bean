build: boosh component_json

boosh:
	node make/build.js && echo ";" >> ./bean.min.js

component_json:
	node make/component.js

components: component_json
	component build
