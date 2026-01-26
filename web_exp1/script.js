const iframe = document.querySelector(".iframe1");

function loadWiki(url) {
    iframe.src = url;
}

// Utility to bind click safely
function bind(areaClass, wikiUrl) {
    const el = document.querySelector("." + areaClass);
    if (!el) return;

    el.addEventListener("click", function (e) {
        e.preventDefault();
        loadWiki(wikiUrl);
    });
}

bind("chennai", "https://en.wikipedia.org/wiki/Chennai_district");
bind("kanchipuram", "https://en.wikipedia.org/wiki/Kanchipuram_district");
bind("thiruvallur", "https://en.wikipedia.org/wiki/Tiruvallur_district");
bind("vellore", "https://en.wikipedia.org/wiki/Vellore_district");
bind("tiruvannamalai", "https://en.wikipedia.org/wiki/Tiruvannamalai_district");
bind("salem", "https://en.wikipedia.org/wiki/Salem_district");
bind("madurai", "https://en.wikipedia.org/wiki/Madurai_district");
bind("tirunelveli", "https://en.wikipedia.org/wiki/Tirunelveli_district");
bind("coimbatore", "https://en.wikipedia.org/wiki/Coimbatore_district");
