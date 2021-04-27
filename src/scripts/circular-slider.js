const HALF_PI = Math.PI * 0.5;
const TWO_PI = Math.PI * 2;
const SVG_NS = "http://www.w3.org/2000/svg";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "x:" + this.x + "y:" + this.y;
    }
}

class EventsListener {
    constructor(id, centerPoint, innerRadius, outerRadius, callback) {
        this.id = id;
        this.centerPoint = centerPoint;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.callback = callback;
    }
}

class EventsHandler {
    idToEventListener = {}
    centerPointToListOfEventListeners = {}
    activeEventListener = undefined;

    constructor() {
        this.init();
    }

    registerEventListener(id, centerPoint, innerRadius, outerRadius, callback) {
        let eventListener = new EventsListener(id, centerPoint, innerRadius, outerRadius, callback);
        this.idToEventListener[eventListener.id] = eventListener;
        this.insertEventListenerIntoCenterPointDict(eventListener);
    }

    insertEventListenerIntoCenterPointDict(eventListener) {
        if (!this.centerPointToListOfEventListeners.hasOwnProperty(eventListener.centerPoint)) {
            this.centerPointToListOfEventListeners[eventListener.centerPoint] = []
        }
        this.centerPointToListOfEventListeners[eventListener.centerPoint].push(eventListener);
    }

    removeEventListenerFromEventListenerIntoCenterPointDict(eventListener) {
        let eventListeners = this.centerPointToListOfEventListeners[eventListener.centerPoint];
        let index = -1;
        for (let i = 0; i < eventListeners.length; i++) {
            if (eventListeners[i].id === eventListener.id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            eventListeners.splice(index, 1);
        }
    }

    updateRadiusOfEventListener(id, innerRadius, outerRadius) {
        this.idToEventListener[id].innerRadius = innerRadius;
        this.idToEventListener[id].outerRadius = outerRadius;
    }

    updateCenterPointOfEventListener(id, newCenterPoint) {
        let eventListener = this.idToEventListener[id];
        this.removeEventListenerFromEventListenerIntoCenterPointDict(eventListener);
        this.idToEventListener[id].centerPoint = newCenterPoint;
        this.insertEventListenerIntoCenterPointDict(eventListener);
    }

    handleActiveTouchEvent(event) {
        let centerX = this.activeEventListener.centerPoint.x;
        let centerY = this.activeEventListener.centerPoint.y;
        let cursorX = event.clientX;
        let cursorY = event.clientY;
        let angle = Math.atan2(cursorY - centerY, cursorX - centerX);
        angle = angle + HALF_PI;
        if (angle < 0) {
            angle = angle + TWO_PI;
        }
        let anglePercentage = angle / TWO_PI;
        this.activeEventListener.callback(anglePercentage);
    }

    init() {
        document.addEventListener("mousemove", (event) => {
            if (this.activeEventListener !== undefined) {
                this.handleActiveTouchEvent(event);
            }
        });
        document.addEventListener("mousedown", (event) => {
            for (let centerPoint in this.centerPointToListOfEventListeners) {
                let eventListeners = this.centerPointToListOfEventListeners[centerPoint];
                for (let i = 0; i < eventListeners.length; i++) {
                    let eventListener = eventListeners[i];
                    let centerX = eventListener.centerPoint.x;
                    let centerY = eventListener.centerPoint.y;
                    let cursorX = event.clientX;
                    let cursorY = event.clientY;
                    let distance = Math.sqrt(Math.pow((cursorX - centerX), 2) + Math.pow((cursorY - centerY), 2));
                    if (distance >= eventListener.innerRadius && distance <= eventListener.outerRadius) {
                        this.activeEventListener = eventListener;
                        this.handleActiveTouchEvent(event);
                        break;
                    }
                }
            }
        });
        document.addEventListener("touchstart", (event) => {
            console.log("touchmove")
        });
        document.addEventListener("touchmove", (event) => {
            console.log("touchmove")
        });
        document.addEventListener("touchcancel", (event) => {
            console.log("touchcancel")
        });
        document.addEventListener("touchend", (event) => {
            console.log("touchend")
        });
        document.addEventListener("mouseup", (event) => {
            if (this.activeEventListener !== undefined) {
                this.activeEventListener = undefined;
            }
        });
        document.addEventListener("mouseleave", (event) => {
            if (this.activeEventListener !== undefined) {
                this.activeEventListener = undefined;
            }
        });
    }
}


class CircularSlider {
    static nextId = 1;
    static eventHandler = new EventsHandler();

    static getRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    }

    id = undefined;
    callback = undefined;
    container = undefined;
    circularSliderViewSvg = undefined;
    progressViewCircle = undefined;
    gridViewCircle = undefined;
    endDotViewCircle = undefined;


    activeProgressColorStart = CircularSlider.getRandomColor();
    activeProgressColorEnd = CircularSlider.getRandomColor();
    minValue = 0;
    value = 25;
    maxValue = 100;
    step = 50;
    radius = 170;


    inactiveProgressColor = "#cfd0d1";
    endDotRadius = 9;
    progressWidth = 18;
    lockRadius = false;

    width = 0;
    height = 0;
    valueRangeSize = 0;
    steps = undefined;
    absoluteCenterPoint = undefined;
    relativeCenterPoint = undefined;
    innerRadius = undefined;
    outerRadius = undefined;
    circumference = undefined;


    // NOTE I make options optional, you do not need to provide them
    constructor(container, options) {
        this.id = CircularSlider.nextId++;
        this.container = container;
        this.setValuesFromOptions(options);
        this.calculateSomeStuff();
        this.createViews();
        this.drawProgressDot();

        this.id = CircularSlider.eventHandler.registerEventListener(this.id, this.absoluteCenterPoint, this.innerRadius, this.outerRadius, (anglePercentage) => {
            let step = Math.ceil(anglePercentage * this.steps);
            this.value = step * (this.maxValue - this.minValue) / this.steps;
            if (this.callback) {
                this.callback(this.value);
            }
            this.drawProgressDot();
        })
    }

    setCallback(callback) {
        this.callback = callback;
    }

    drawProgressDot() {
        this.drawProgressSvg();
        this.positionDotSvgCircle();
    }


    setValuesFromOptions(options) {
        this.lockRadius = false;
        if (options) {
            if (options['radius']) {
                this.radius = options['radius'];
                this.lockRadius = true;
            }
            if (options['color']) {
                this.activeProgressColorStart = options['color'];
            }
            if (options['minValue']) {
                this.minValue = options['minValue'];
            }
            if (options['maxValue']) {
                this.maxValue = options['maxValue'];
            }
            if (options['value']) {
                this.value = options['value'];
            }
            if (options['step']) {
                this.step = options['step'];
            }
        }
    }

    calculateSomeStuff() {
        this.valueRangeSize = Math.abs(this.maxValue - this.minValue);
        this.activeProgressColorEnd = shadeColor(this.activeProgressColorStart, 80);
        this.steps = this.valueRangeSize / this.step;
        this.innerRadius = this.radius - this.progressWidth / 2;
        this.outerRadius = this.radius + this.progressWidth / 2;
        this.height = this.width = this.outerRadius * 2;
        this.circumference = this.radius * TWO_PI;

        this.relativeCenterPoint = new Point(
            this.container.offsetWidth / 2,
            this.container.offsetHeight / 2
        );
        this.absoluteCenterPoint = new Point(
            this.relativeCenterPoint.x + this.container.offsetLeft,
            this.relativeCenterPoint.y + this.container.offsetTop
        );

    }


    createViews() {
        this.circularSliderViewSvg = document.createElementNS(SVG_NS, 'svg');
        this.circularSliderViewSvg.classList.add("circular-slider");
        this.container.appendChild(this.circularSliderViewSvg);

        let defsView = document.createElementNS(SVG_NS, 'defs');
        let mask = document.createElementNS(SVG_NS, 'mask');
        mask.setAttribute("id", "mask" + this.id);
        mask.setAttribute("maskUnits", "userSpaceOnUse");

        let rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", this.container.offsetWidth);
        rect.setAttribute("height", this.container.offsetHeight);
        mask.appendChild(rect);

        for (let i = 0; i < this.steps; i++) {
            let angle = ((i / this.steps) * TWO_PI) - HALF_PI;
            let startX = this.innerRadius * Math.cos(angle) + this.relativeCenterPoint.x;
            let startY = this.innerRadius * Math.sin(angle) + this.relativeCenterPoint.y;
            let endX = this.outerRadius * Math.cos(angle) + this.relativeCenterPoint.x;
            let endY = this.outerRadius * Math.sin(angle) + this.relativeCenterPoint.y;
            let lineView = document.createElementNS(SVG_NS, 'line');
            lineView.setAttribute("x1", startX);
            lineView.setAttribute("y1", startY);
            lineView.setAttribute("x2", endX);
            lineView.setAttribute("y2", endY);
            mask.appendChild(lineView);

        }
        defsView.appendChild(mask);
        this.circularSliderViewSvg.appendChild(defsView);

        this.gridViewCircle = document.createElementNS(SVG_NS, 'circle');
        this.gridViewCircle.classList.add('grid-circle');
        this.gridViewCircle.setAttribute("r", `${this.radius}`);
        this.gridViewCircle.setAttribute("stroke-width", this.progressWidth);
        this.gridViewCircle.setAttribute("cx", this.relativeCenterPoint.x);
        this.gridViewCircle.setAttribute("cy", this.relativeCenterPoint.y);
        this.gridViewCircle.setAttribute("stroke", this.inactiveProgressColor);
        this.gridViewCircle.setAttribute("mask", `url(#mask${this.id})`);
        this.circularSliderViewSvg.appendChild(this.gridViewCircle);


        // TODO make something more similar to the conic gradient
        let linearGradient = document.createElementNS(SVG_NS, 'linearGradient');
        linearGradient.setAttribute("id", "gradient" + this.id);
        linearGradient.setAttribute("x1", "0%");
        linearGradient.setAttribute("y1", "0%");
        linearGradient.setAttribute("x2", "100%");
        linearGradient.setAttribute("y2", "100%");

        let linearGradientStop = document.createElementNS(SVG_NS, 'stop');
        linearGradientStop.setAttribute("offset", "0%");
        linearGradientStop.setAttribute("stop-color", this.activeProgressColorEnd);
        linearGradient.appendChild(linearGradientStop);

        linearGradientStop = document.createElementNS(SVG_NS, 'stop');
        linearGradientStop.setAttribute("offset", "100%");
        linearGradientStop.setAttribute("stop-color", this.activeProgressColorStart);
        linearGradient.appendChild(linearGradientStop);

        this.circularSliderViewSvg.appendChild(linearGradient);


        this.progressViewCircle = document.createElementNS(SVG_NS, 'circle');
        this.progressViewCircle.classList.add('progress-circle');
        this.progressViewCircle.setAttribute("r", `${this.radius}`);
        this.progressViewCircle.setAttribute("stroke-width", this.progressWidth);
        this.progressViewCircle.setAttribute("cx", this.relativeCenterPoint.x);
        this.progressViewCircle.setAttribute("cy", this.relativeCenterPoint.y);
        this.progressViewCircle.setAttribute("stroke", `url(#gradient${this.id})`);
        // this.progressViewCircle.style.stroke = this.activeProgressColorStart;

        this.progressViewCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circularSliderViewSvg.appendChild(this.progressViewCircle);

        this.endDotViewCircle = document.createElementNS(SVG_NS, 'circle');
        this.endDotViewCircle.classList.add('end-dot-circle');
        this.endDotViewCircle.setAttribute("r", this.endDotRadius);
        this.circularSliderViewSvg.appendChild(this.endDotViewCircle);
    }

    getValuePartOfRange() {
        return (Math.abs(this.value - this.minValue) / (this.valueRangeSize));
    }

    drawProgressSvg() {
        const offset = this.circumference - this.getValuePartOfRange() * this.circumference;
        this.progressViewCircle.style.strokeDashoffset = `${offset}`;
    }

    positionDotSvgCircle() {
        let middleAngle = this.getValuePartOfRange() * TWO_PI - HALF_PI
        let x = this.radius * Math.cos(middleAngle) + this.relativeCenterPoint.x;
        let y = this.radius * Math.sin(middleAngle) + this.relativeCenterPoint.y;
        this.endDotViewCircle.setAttribute("cx", x);
        this.endDotViewCircle.setAttribute("cy", y);
    }
}

