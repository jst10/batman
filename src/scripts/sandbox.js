window.onload = function () {
    init();
};


function init() {
    addSliderLegend(750, 10, 145, "#2d0050", "Transportation");//#61467b
    addSliderLegend(650, 10, 119, "#003a93", "Food");//#167fc3
    addSliderLegend(500, 10, 93, "#2a7800", "Insurance");//#55a328
    addSliderLegend(800, 20, 67, "#d96a01", "Entertainment")//##e78a37
    addSliderLegend(200, 25, 41, "#cb1002", "Health care")//##ee6054
}

function addSliderLegend(value, step, radius, color, label) {
    let sliderContainer = document.getElementById("slider-container");
    let legendContainer = document.getElementById("legend-container");
    let slider = new CircularSlider(sliderContainer, {radius: radius, color: color, value: value, maxValue: 1000, step: step});
    let legend = new CircularSliderLegend(legendContainer, {prefix: "$", color: color, label: label, value: value});
    slider.setCallback(legend.setValue);
}
