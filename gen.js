"use strict";
var fs = require("fs-extra");
var jsdom = require("jsdom");

var datas = [];
var count = 0;
var data, special;
var replaceRegex = /("!)?%([a-zA-Z\.]+)%(!")?/g;


function generate(data) {
    var name = data.meta.dir;
    var product = "products/" + name + "/";
    var template = "product-template/";
    var backup = "backups/" + name + "/";
    var resources = "data/" + name + "/";

    // Backup
    if (fs.existsSync(product)) {
        if (fs.existsSync(backup)) {
            fs.removeSync(backup);
        }
        fs.renameSync(product, backup);
    }

    // Copying
    fs.copySync(template, product);
    fs.copySync("bower_components", product + "bower_components");
    if (fs.existsSync(resources)) {
        fs.copySync(resources, product + "resources");
    }

    // Transform HTML
    var html = fs.readFileSync(product + "index.html");
    html = (html + "").replace(replaceRegex, replacer);
    fs.writeFileSync(product + "index.html", html);

    // Transform JavaScript
    var js = fs.readFileSync(product + "js/script.js");
    js = (js + "").replace(replaceRegex, replacer);

    fs.writeFileSync(product + "js/script.js", js);

    console.log("Just did " + product);
    // Call genSpecial again
    count = count + 1;
    genSpecial();
}

function genLandingSections() {
    console.log("DOM " + data.meta.name);
    jsdom.env("", function(errors, window) {
        var jsdom = require("jsdom").jsdom;

        var window = jsdom().parentWindow;
        var document = window.document;

        // Vars
        var i;
        var wrap;

        // Landing vars
        var landing;
        var section;
        var tile;
        var text;
        var image;

        // Changelog vars
        var changelog;
        var version;
        var p;
        var title;
        var change;

        // Landing generator (incomplete)
        landing = document.createElement("div");
        landing.className = "landing";

        for (i = 0; i < data.landing.sections.length; i++) {
            section = data.landing.sections[i];

            if (section.text) {
                text = document.createElement("span");
            }

            tile = document.createElement("div");

            text = "";
        }

        // Changelog generator
        changelog = document.createElement("div");
        changelog.className = "changelog";

        for (i = data.changelog.versions.length - 1; i >= 0; i--) {
            version = data.changelog.versions[i];

            p = document.createElement("p");
            p.setAttribute("md-padding", "");
            p.setAttribute("data-version", version.number);


            title = document.createElement("span");
            title.setAttribute("md-typo", "title");
            title.innerHTML = version.number + "<br>";

            change = document.createElement("span");
            change.innerHTML = version.changes.join("<br>");

            p.appendChild(title);
            p.appendChild(change);

            changelog.appendChild(p);
        }

        // Landing HTML extraction
        wrap = document.createElement("div");
        wrap.appendChild(landing);

        // Landing export 
        special.landing.html = wrap.innerHTML;

        // Changelog HTML extraction
        wrap.innerHTML = "";
        wrap.appendChild(changelog);

        // Changelog export 
        special.changelog.html = wrap.innerHTML;

        console.log("DOM END " + data.meta.name);
        generate(data);
    });
}

function genSpecial() {
    if (datas[count]) {
        data = datas[count];
    } else {
        return;
    }
    console.log("Special " + data.meta.name);
    special = {
        "version": data.changelog.versions[data.changelog.versions.length - 1].number,
        "landing": {
            "html": ""
        },
        "changelog": {
            "html": "",
            "theme": data.theme
        }
    };
    special.javascript = {
        "changelog": data.changelog,
        "version": special.version
    };
    genLandingSections();
}

function objString(obj, is, value) {
    if (!obj) {
        return false;
    }
    if (typeof is === "string") {
        return objString(obj, is.split("."), value);
    } else if (is.length === 1 && value !== undefined) {
        obj[is[0]] = value;
        return value;
    } else if (is.length === 0) {
        return obj;
    } else {
        return objString(obj[is[0]], is.slice(1), value);
    }
}

function replacer(a, b, name) {
    var output = objString(special, name) || objString(data, name) || "ERROR: [" + name + "] does not exists";
    if (typeof output === "object") {
        output = JSON.stringify(output);
    } else if (a.indexOf("!") > -1) {
        output = "\"" + output + "\"";
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
    if (!fs.statSync("data/" + products[i]).isDirectory()) {
        console.log("Processing " + products[i]);
        datas.push(fs.readJSONSync("data/" + products[i]));
    }
}
genSpecial();
