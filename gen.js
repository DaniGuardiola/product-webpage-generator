"use strict";
var fs = require("fs-extra");

var data, special;
var replaceRegex = /("!)?%([a-zA-Z]+)%(!")?/g;


function generate(data) {
    // console.log(data);

    var name = data.dirName;
    var product = "products/" + name + "/";
    var template = "product-template/";
    var backup = "backups/" + name + "/";
    var resources = "data/" + name + "/";

    /* Backup */
    if (fs.existsSync(product)) {
        if (fs.existsSync(backup)) {
            fs.removeSync(backup);
        }
        fs.renameSync(product, backup);
    }

    /* Copying */
    fs.copySync(template, product);
    fs.copySync("bower_components", product + "bower_components");
    if (fs.existsSync(resources)) {
        fs.copySync(resources, product + "resources");
    }

    /* Transform HTML */
    var html = fs.readFileSync(product + "index.html");
    // console.log(html + "");
    html = (html + "").replace(replaceRegex, replacer);
    // console.log(html + "");
    fs.writeFileSync(product + "index.html", html);

    /* Transform JavaScript */
    var js = fs.readFileSync(product + "js/script.js");
    // console.log(js + "");
    js = (js + "").replace(replaceRegex, replacer);
    // console.log(js + "");

    fs.writeFileSync(product + "js/script.js", js);
}

function genSpecial(data) {
    var special = {
        "currentVersion": data.changelog[data.changelog.length - 1].number
    };
    special.javascript = {
        "changelog": data.changelog,
        "version": special.currentVersion
    };

    return special;
}

function replacer(a, b, name) {
    var output = special[name] || data[name] || "ERROR: [" + name + "] does not exists!";
    if (typeof output === "object") {
        output = JSON.stringify(output);
    }
    return output;
}

var products = fs.readdirSync("data/");

if (!fs.existsSync("data/")) {
    throw "No data folder available!";
}

if (!fs.existsSync("backups/")) {
    fs.mkdirSync("backups/");
}

if (!fs.existsSync("backups/")) {
    fs.mkdirSync("backups/");
}

for (var i = products.length - 1; i >= 0; i--) {
    if (!fs.statsSync("data/" + products[i]).isDirectory()) {
        data = fs.readJSONSync("data/" + products[i]);
        special = genSpecial(data);
        generate(data);
    }
}
