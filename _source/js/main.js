if (window.devicePixelRatio >= 1.2) {
    var elems = document.getElementsByTagName("*");
    for (var i = 0; i < elems.length; i++) {
        var attr = elems[i].getAttribute("data-2x");
        if (attr && elems[i].tagName == "IMG") {
            elems[i].src = attr;
        } else if (attr) {
            elems[i].style.cssText += "background-image: url(" + attr + ")";
        }
    }
}
