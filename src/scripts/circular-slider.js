class CircularSlider {
    static getRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    }

    static produceFullSizeCanvas(container, classNames, zIndex) {
        let canvas = document.createElement('canvas');
        canvas.classList.add(classNames);
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        canvas.style.zIndex = zIndex;
        container.appendChild(canvas);
        return canvas;
    }

    container = undefined;
    progressCanvas = undefined;
    gridCanvas = undefined;
    gridColor = undefined;
    inactiveProgressColor = "#d3d4d4";
    activeProgressColor = CircularSlider.getRandomColor();
    minValue = 0;
    value = 25;
    maxValue = 100;
    steps = 10;
    progressWidth = 25;
    progressInnerRadius = 170;
    lockRadius = false;
    settingMode = false;


    // NOTE I make options optional, you do not need to provide them
    constructor(container, options) {
        this.container = container;
        this.gridColor = container.style.backgroundColor;
        this.setValuesFromOptions(options);
        this.createViews();
        this.initListeners();
        this.drawProgress();
        this.drawGrid();
    }

    setValuesFromOptions(options) {
        this.lockRadius = false;
        if (options) {
            if (options['progressInnerRadius']) {
                this.progressInnerRadius = options['progressInnerRadius'];
                this.lockRadius = true;
            }
            if (options['activeProgressColor']) {
                this.activeProgressColor = options['activeProgressColor'];
            }
            if (options['minValue']) {
                this.minValue = options['minValue'];
            }
            if (options['maxValue']) {
                this.maxValue = options['maxValue'];
            }
            // NOTE I changed step int steps, so that end user does not need to calculate this stuff
            if (options['steps']) {
                this.steps = options['steps'];
            }
        }
    }

    calculateSomeStuff() {

    }

    initListeners() {
        //this.progressCanvas.
        document.addEventListener("mousemove", (event) => {
            let cursorX = event.clientX - this.container.offsetLeft;
            let cursorY = event.clientY - this.container.offsetTop;
            // console.log(cursorX + "/" + cursorY);

            let cX = this.progressCanvas.width / 2;
            let cy = this.progressCanvas.height / 2;

            let coX = cursorX;
            let coY = cursorY;

            let angle = Math.atan2(coY - cy, coX - cX);
            if (angle < 0) {
                angle = angle + Math.PI * 2;
            }
            // angle += Math.PI / 2;


            this.value = angle * 180 / Math.PI;
            console.log(coX + "/" + coY + "    " + cX + "/" + cy + "  -> " + this.value);
        });
        //this.progressCanvas.
        document.addEventListener("mousedown", (event) => {
            console.log("mouse mousedown")
            this.settingMode = true;
        });
        //this.progressCanvas.
        document.addEventListener("mouseup", (event) => {
            console.log("mouse mouseup")
            this.settingMode = false;
        });
        //this.progressCanvas.
        document.addEventListener("mouseleave", (event) => {
            console.log("mouse mouseleave")
            this.settingMode = false;
        });

    }


    createViews() {
        this.progressCanvas = CircularSlider.produceFullSizeCanvas(this.container, "circular-slider", 10);
        this.gridCanvas = CircularSlider.produceFullSizeCanvas(this.container, "circular-slider", 11);
    }

    drawProgress() {
        let ctx = this.progressCanvas.getContext("2d");
        let startAngle = 0 - (Math.PI / 2);
        let middleAngle = ((this.value / (this.maxValue - this.minValue)) * 2 * Math.PI) - (Math.PI / 2);
        let endAngle = 2 * Math.PI - (Math.PI / 2);

        ctx.lineWidth = this.progressWidth;
        ctx.beginPath();
        ctx.arc(this.progressCanvas.width / 2, this.progressCanvas.height / 2, this.progressInnerRadius, startAngle, middleAngle);
        ctx.strokeStyle = this.activeProgressColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.progressCanvas.width / 2, this.progressCanvas.height / 2, this.progressInnerRadius, middleAngle, endAngle);
        ctx.strokeStyle = this.inactiveProgressColor;
        ctx.stroke();

    }

    drawGrid() {
        let ctx = this.gridCanvas.getContext("2d");
        ctx.strokeStyle = "#000000";
        let startDistance = this.progressInnerRadius - this.progressWidth / 2;
        let endDistance = this.progressInnerRadius + this.progressWidth / 2;
        let offsetX = this.progressCanvas.width / 2;
        let offsetY = this.progressCanvas.height / 2;
        ctx.strokeStyle = this.gridColor;
        for (let i = 0; i < this.steps; i++) {
            let angle = ((i / this.steps) * 2 * Math.PI) - (Math.PI / 2);
            let startX = startDistance * Math.cos(angle) + offsetX;
            let startY = startDistance * Math.sin(angle) + offsetY;
            let endX = endDistance * Math.cos(angle) + offsetX;
            let endY = endDistance * Math.sin(angle) + offsetY;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }


    }
}
