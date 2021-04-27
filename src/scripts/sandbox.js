window.onload = function () {
    init();
};


function init() {
    addSliderLegend(750, 10, 145, "#4c0f7d", "Transportation");//#61467b
    addSliderLegend(650, 10, 119, "#0050c9", "Food");//#167fc3
    addSliderLegend(500, 20, 93, "#349301", "Insurance");//#55a328
    addSliderLegend(800, 20, 67, "#dc700a", "Entertainment")//##e78a37
    addSliderLegend(200, 25, 41, "#e2281a", "Health care")//##ee6054
}

function addSliderLegend(value, step, radius, color, label) {
    let sliderContainer = document.getElementById("slider-container");
    let legendContainer = document.getElementById("legend-container");
    let slider = new CircularSlider(sliderContainer, {radius: radius, color: color, value: value, maxValue: 1000, step: step});
    let legend = new CircularSliderLegend(legendContainer, {prefix: "$", color: color, label: label, value: value});
    slider.setCallback(legend.setValue);
}
