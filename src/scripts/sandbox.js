window.onload = function () {
    init();
};

function init() {
    console.log("I should initialize everything here...");

    addSliderLegend(750, 40, "#ea5f53", "Health care");
    addSliderLegend(650, 80, "#ed8c37", "Entertainment");
    addSliderLegend(500, 120, "#69ae3f", "Insurance");
    addSliderLegend(800, 160, "#1f90cf", "Food");
    addSliderLegend(200, 200, "#745493", "Transportation");

}

function addSliderLegend(value, radius, color, label) {
    let sliderContainer = document.getElementById("slider-container");
    let legendContainer = document.getElementById("legend-container");
    let slider = new CircularSlider(sliderContainer, {radius: radius, color: color, value: value,maxValue:1000});
    let legend = new CircularSliderLegend(legendContainer, {prefix: "$", color: color, label: label, value: value});
    slider.setCallback(legend.setValue);
}
