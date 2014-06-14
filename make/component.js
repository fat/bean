var fs = require("fs");
var data = fs.readFileSync("package.json", "utf8");
var packagejson = JSON.parse(data);
fs.writeFileSync("component.json", JSON.stringify({
        name: packagejson.name,
        description: packagejson.description,
        version: packagejson.version,
        keywords: packagejson.keywords,
        main: "bean.js",
        scripts: ["bean.js"],
        repo: "https://github.com/fat/bean"
    }, null, 2)
);
