class CircularSliderLegend {
    container = undefined;
    wrapper = undefined;
    valueSpan = undefined;
    colorSpan = undefined;
    labelSpan = undefined;

    prefix = "";
    value = 0;
    label = "";
    color = "#00FFFF"

    constructor(container, options) {
        this.container = container;
        this.setValuesFromOptions(options);
        this.createViews();
        this.applyValuesOnSpans();
    }

    setValuesFromOptions(options) {
        this.prefix = "";
        this.label = "";
        if (options) {
            if (options.hasOwnProperty("prefix")) {
                this.prefix = options['prefix'];
            }
            if (options.hasOwnProperty("label")) {
                this.label = options['label'];
            }
            if (options.hasOwnProperty("color")) {
                this.color = options['color'];
            }
            if (options.hasOwnProperty("value")) {
                this.value = options['value'];
            }
        }
    }

    createViews() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add("circular-slider-legend");
        this.container.appendChild(this.wrapper);
        this.valueSpan = document.createElement('span');
        this.valueSpan.classList.add("value-span");
        this.wrapper.appendChild(this.valueSpan);
        this.colorSpan = document.createElement('span');
        this.colorSpan.classList.add("color-span");
        this.wrapper.appendChild(this.colorSpan);
        this.labelSpan = document.createElement('span');
        this.labelSpan.classList.add("label-spans");
        this.wrapper.appendChild(this.labelSpan);
    }

    applyValuesOnSpans() {
        this.applyValueOnSpan();
        this.applyColorOnSpan();
        this.applyLabelOnSpan();
    }

    setValue = (value) => {
        this.value = value;
        this.applyValuesOnSpans();
    }

    applyValueOnSpan() {
        this.valueSpan.textContent = this.prefix + this.value
    }

    applyColorOnSpan() {
        this.colorSpan.style.backgroundColor = this.color
    }

    applyLabelOnSpan() {
        this.labelSpan.textContent = this.label;
    }

}
