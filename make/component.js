var fs = require("fs");
fs.readFile('./package.json', "utf8", function (err, data) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    var packagejson = JSON.parse(data);
    fs.writeFile("component.json", JSON.stringify({
            name: packagejson.name,
            description: packagejson.description,
            version: packagejson.version,
            keywords: packagejson.keywords,
            main: "bean.js",
            scripts: ["bean.js"],
            repo: "https://github.com/fat/bean"
        }, null, 4),
        function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        }
    );
});
