window.onload = function () {
    init();
};

function init() {
    console.log("I should initialize everything here...");
    panel=document.getElementById("container");
    cs = new CircularSlider(panel,{radius:40});
    cs = new CircularSlider(panel,{radius:80});
    cs = new CircularSlider(panel,{radius:120});
    cs = new CircularSlider(panel,{radius:160});
    cs = new CircularSlider(panel,{radius:200});
    cs = new CircularSlider(panel,{radius:240});
    cs = new CircularSlider(panel,{radius:280});
}
