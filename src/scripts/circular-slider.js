class CircularSlider {
    static getRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    }

    static createEndDot(container, dimension, zIndex) {
        let view = document.createElement('span');
        view.classList.add("circular-slider-dot");
        view.style.zIndex = zIndex;
        view.style.width = dimension + "px";
        view.style.height = dimension + "px";
        container.appendChild(view);
        return view;
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
    endDot = undefined;
    endDotRadius = 30;
    gridColor = undefined;
    inactiveProgressColor = "#d3d4d4";
    activeProgressColor = CircularSlider.getRandomColor();
    minValue = 0;
    value = 25;
    maxValue = 100;
    steps = 100;
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
            if (options['radius']) {
                this.progressInnerRadius = options['radius'];
                this.lockRadius = true;
            }
            if (options['color']) {
                this.activeProgressColor = options['color'];
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
            if (this.settingMode) {
                let cursorX = event.clientX - this.container.offsetLeft;
                let cursorY = event.clientY - this.container.offsetTop;

                let cX = this.progressCanvas.width / 2;
                let cy = this.progressCanvas.height / 2;

                let coX = cursorX;
                let coY = cursorY;

                let angle = Math.atan2(coY - cy, coX - cX);
                angle = angle + 0.5 * Math.PI;
                if (angle < 0) {
                    angle = angle + Math.PI * 2;
                }
                let anglePercentage = angle / (Math.PI * 2);
                let step = Math.ceil(anglePercentage * this.steps);
                this.value = step * (this.maxValue - this.minValue) / this.steps;
                this.drawProgress();
            }
        });
        document.addEventListener("mousedown", (event) => {
            console.log("mouse mousedown")

            let centerX = this.progressCanvas.width / 2;
            let centerY = this.progressCanvas.height / 2
            let cursorX = event.clientX - this.container.offsetLeft;
            let cursorY = event.clientY - this.container.offsetTop;
            let distance = Math.sqrt(Math.pow((cursorX - centerX), 2) + Math.pow((cursorY - centerY), 2));

            let startDistance = this.progressInnerRadius - this.progressWidth / 2;
            let endDistance = this.progressInnerRadius + this.progressWidth / 2;
            if (distance >= startDistance && distance <= endDistance) {
                this.settingMode = true;
            }
        });
        document.addEventListener("mouseup", (event) => {
            console.log("mouse mouseup")
            this.settingMode = false;
        });
        document.addEventListener("mouseleave", (event) => {
            console.log("mouse mouseleave")
            this.settingMode = false;
        });

    }


    createViews() {
        this.progressCanvas = CircularSlider.produceFullSizeCanvas(this.container, "circular-slider", 10);
        this.gridCanvas = CircularSlider.produceFullSizeCanvas(this.container, "circular-slider", 11);
        this.endDot = CircularSlider.createEndDot(this.container, this.endDotRadius, 12);
    }

    drawProgress() {
        let ctx = this.progressCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.progressCanvas.width, this.progressCanvas.height);
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
        this.positionDot();

    }

    positionDot() {
        let middleAngle = 2 * Math.PI - ((this.value / (this.maxValue - this.minValue)) * 2 * Math.PI) - Math.PI
        let distance = this.progressInnerRadius;
        let offsetX = this.progressCanvas.width / 2 - this.endDot.offsetWidth / 2;
        let offsetY = this.progressCanvas.height / 2 - this.endDot.offsetHeight / 2;
        let x = distance * Math.cos(middleAngle) + offsetX;
        let y = distance * Math.sin(middleAngle) + offsetY;
        this.endDot.style.top = x + "px";
        this.endDot.style.left = y + "px";
    }

    drawGrid() {
        let ctx = this.gridCanvas.getContext("2d");
        let startDistance = this.progressInnerRadius - this.progressWidth / 2;
        let endDistance = this.progressInnerRadius + this.progressWidth / 2;
        let offsetX = this.progressCanvas.width / 2;
        let offsetY = this.progressCanvas.height / 2;
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 0.5;
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
            ctx.stroke();
        }
    }
}
