"use strict";
var paperkit = new Paperkit();
window.addEventListener("load", function() {
    init();
});

var data = "!%javascript%!";

function init() {

    var hash = window.location.hash.split("?")[0];
    var tabs = document.querySelector("#main-paper md-tabbar");
    var tab = tabs.children[0];
    var tabCopy = tab.cloneNode();
    tabCopy.classList.add("hidden");
    var p;
    var landingTitle = document.getElementById("landing-title");
    var landingText = document.getElementById("landing-text");
    var landingHTML = document.getElementById("landing-html");
    var version = document.getElementById("version");
    var changelog = document.querySelector("#main-paper .changelog");

    function param(query) {
        var url = window.location.href;
        var re = new RegExp("/.*[?&]" + query + "=([^&]+)(&|$)");
        var match = url.match(re);
        return (match ? match[1] : "");
    }

    if (param("version")) {
        if (param("version") === "latest") {
            p = changelog.querySelector("p:first-of-type");
        } else {
            p = changelog.querySelector("p[data-version=\"" + param("version") + "\"]");
        }
        if (p) {
            version.textContent = p.getAttribute("data-version");
            p.setAttribute("md-color", data.theme.color + "-100");
        }
    }

    if (param("update") === "true") {
        landingTitle.innerHTML = data.changelog.landing.title;
        landingTitle.classList.add("center");
        landingText.classList.add("hidden");
        landingHTML.classList.add("hidden");

        tabs.classList.add("no-landing");
    }

    paperkit.init();

    if (hash === "#changes") {
        if (param("update")) {
            setTimeout(function() {
                tabs.children[1].click();
            }, 2000);
        } else {
            tabs.children[1].click();
        }
    }

}


function donate() {
    window.open("!%meta.donate%!");
}
