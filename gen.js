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
    html = (html + "").replace(replaceRegex, replacer)
        .replace(replaceRegex, replacer)
        .replace(replaceRegex, replacer);
    fs.writeFileSync(product + "index.html", html);

    // Transform JavaScript
    var js = fs.readFileSync(product + "js/script.js");
    js = (js + "").replace(replaceRegex, replacer)
        .replace(replaceRegex, replacer)
        .replace(replaceRegex, replacer);

    fs.writeFileSync(product + "js/script.js", js);

    console.log("Generated " + product);
    // Call genSpecial again
    count = count + 1;
    genSpecial();
}

function genLandingSections() {
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
        var stuff;
        var text;
        var textP;
        var image;

        // Changelog vars
        var changelog;
        var version;
        var p;
        var title;
        var change;

        // FAQ vars
        var faq;
        var qanda;
        var question;
        var answer;

        // Landing generator (incomplete)
        landing = document.createElement("div");
        landing.className = "landing";

        for (i = 0; i < data.landing.sections.length; i++) {
            section = data.landing.sections[i];
            tile = document.createElement("div");

            stuff = stuff === "-700" ? "" : "-700";

            tile.setAttribute("md-color", data.theme.color + stuff);

            if (section.text) {
                text = document.createElement("div");
                text.className = "text";
                text.setAttribute("md-padding", "");

                textP = document.createElement("span");
                textP.textContent = section.text;

                text.appendChild(textP);

                tile.appendChild(text);
            }

            if (section.image) {
                image = document.createElement("img");
                image.src = "template/" + section.image;
                tile.appendChild(image);
            }

            landing.appendChild(tile);
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

        // FAQ generator
        faq = document.createElement("div");
        faq.className = "faq";

        for (i = 0; i < data.faq.questions.length; i++) {
            qanda = data.faq.questions[i];

            p = document.createElement("p");
            p.setAttribute("md-padding", "");


            question = document.createElement("span");
            question.setAttribute("md-typo", "title");
            question.innerHTML = qanda.question + "<br>";

            answer = document.createElement("span");
            answer.innerHTML = qanda.answer;

            p.appendChild(question);
            p.appendChild(answer);

            faq.appendChild(p);
        }

        // Landing export 
        special.landing.html = landing.innerHTML;

        // Creating wrapper element
        wrap = document.createElement("div");

        // Changelog HTML extraction
        wrap.innerHTML = "";
        wrap.appendChild(changelog);

        // Changelog export 
        special.changelog.html = wrap.innerHTML;

        // FAQ HTML extraction
        wrap.innerHTML = "";
        wrap.appendChild(faq);

        // FAQ export 
        special.faq.html = wrap.innerHTML;

        generate(data);
    });
}

function genSpecial() {
    if (datas[count]) {
        data = datas[count];
        data.meta.emailparam = "subject=%meta.subject%&body=%meta.content%";
    } else {
        return;
    }
    special = {
        "social": {
            "twitter": {
                "msg": encodeURIComponent(data.social.twitter.msg),
                "user": data.social.twitter.user
            }
        },
        "version": data.changelog.versions[data.changelog.versions.length - 1].number,
        "landing": {
            "html": ""
        },
        "changelog": {
            "html": ""
        },
        "faq": {
            "html": ""
        }
    };
    special.javascript = {
        "changelog": data.changelog,
        "version": special.version,
        "theme": data.theme,
        "meta": {
            "subject": encodeURIComponent(data.meta.title + " - Feedback")
        },
        "social": data.social
    };
    special.javascript.social.twitter = special.social.twitter;
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
        datas.push(fs.readJSONSync("data/" + products[i]));
    }
}
genSpecial();
