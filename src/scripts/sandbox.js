window.onload = function () {
    init();
};

function init() {
    console.log("I should initialize everything here...");
    panel=document.getElementById("container");
    cs = new CircularSlider(panel);
}
