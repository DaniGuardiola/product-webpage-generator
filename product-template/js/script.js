"use strict";
var paperkit = new Paperkit();
window.addEventListener("load", function() {
    init();
});

var data = "!%javascript%!";

function init() {

    var hash = window.location.hash.split("?")[0];
    var tabs = document.querySelector("#main-paper md-tabbar");
    var p;
    var landingTitle = document.getElementById("landing-title");
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
            p.setAttribute("md-color", "!%theme.color%!" + "-700");
        }
    }

    if (param("update") === "true") {
        landingTitle.textContent = "!%changelog.landing%!";
        tabs.children[0].textContent = "!%changelog.landingTab%!";
    }

    paperkit.init();

    if (hash === "#changelog") {
        setTimeout(function() {
            tabs.children[1].click();
        }, 3000);
    }

}


function donate() {
    window.open("!%meta.donate%!");
}
