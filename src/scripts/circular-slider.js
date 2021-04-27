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

    static produceFullSizeSvg(container, classNames, zIndex) {
        let svg = document.createElementNS(SVG_NS, 'svg');
        svg.classList.add(classNames);
        svg.style.zIndex = zIndex;
        container.appendChild(svg);
        return svg;
    }

    callback = undefined;
    id = undefined;
    container = undefined;
    progressSvg = undefined;
    progressSvgCircle = undefined;
    progressGridCircle = undefined;
    endDotSvgCircle = undefined;
    endDotRadius = 16;
    inactiveProgressColor = "#d3d4d4";
    activeProgressColor = CircularSlider.getRandomColor();
    minValue = 0;
    value = 25;
    maxValue = 100;
    steps = 50;
    progressWidth = 25;
    progressInnerRadius = 170;
    lockRadius = false;
    settingMode = false;


    centerPoint = undefined;
    innerRadius = undefined;
    outerRadius = undefined;


    // NOTE I make options optional, you do not need to provide them
    constructor(container, options) {
        this.id = CircularSlider.nextId++;
        this.container = container;
        this.setValuesFromOptions(options);
        this.calculateSomeStuff();
        this.createViews();
        this.id = CircularSlider.eventHandler.registerEventListener(this.id, this.centerPoint, this.innerRadius, this.outerRadius, (anglePercentage) => {
            let step = Math.ceil(anglePercentage * this.steps);
            this.value = step * (this.maxValue - this.minValue) / this.steps;
            if (this.callback) {
                this.callback(this.value);
            }
            this.drawProgressDot();
        })

        this.drawProgressDot();
        // this.drawGrid();
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
            if (options['value']) {
                this.value = options['value'];
            }
            // NOTE I changed step int steps, so that end user does not need to calculate this stuff
            if (options['steps']) {
                this.steps = options['steps'];
            }
        }
    }

    calculateSomeStuff() {
        this.centerPoint = new Point(
            this.container.offsetWidth / 2 + this.container.offsetLeft,
            this.container.offsetHeight / 2 + this.container.offsetTop
        );
        this.innerRadius = this.progressInnerRadius - this.progressWidth / 2;
        this.outerRadius = this.progressInnerRadius + this.progressWidth / 2;
    }


    createViews() {
        this.progressSvg = CircularSlider.produceFullSizeSvg(this.container, "circular-slider", 10);

        let defsView = document.createElementNS(SVG_NS, 'defs');
        // let clipPath = document.createElementNS(SVG_NS, 'clipPath');
        let mask = document.createElementNS(SVG_NS, 'mask');
        mask.setAttributeNS(null, "id", "mask" + this.id);
        mask.setAttributeNS(null, "maskUnits", "userSpaceOnUse");

        let rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttributeNS(null, "x", 0);
        rect.setAttributeNS(null, "y", 0);
        rect.setAttributeNS(null, "width", this.container.offsetWidth);
        rect.setAttributeNS(null, "height", this.container.offsetHeight);
        rect.setAttributeNS(null, "fill", "#FFFFFF");
        mask.appendChild(rect);

        let startDistance = this.progressInnerRadius - this.progressWidth / 2;
        let endDistance = this.progressInnerRadius + this.progressWidth / 2;
        let offsetX = this.container.offsetWidth / 2;
        let offsetY = this.container.offsetHeight / 2;

        for (let i = 0; i < this.steps; i++) {
            let angle = ((i / this.steps) * TWO_PI) - HALF_PI;
            let startX = startDistance * Math.cos(angle) + offsetX;
            let startY = startDistance * Math.sin(angle) + offsetY;
            let endX = endDistance * Math.cos(angle) + offsetX;
            let endY = endDistance * Math.sin(angle) + offsetY;
            // let lineView = document.createElementNS(SVG_NS, 'circle');
            // lineView.setAttributeNS(null, "cx", 200);
            // lineView.setAttributeNS(null, "cy", 200);
            // // lineView.setAttributeNS(null, "fill", "#FFFFFF");
            // lineView.setAttributeNS(null, "fill", "#000000");
            // lineView.setAttributeNS(null, "r", 52);

            let lineView = document.createElementNS(SVG_NS, 'line');
            lineView.setAttributeNS(null, "x1", startX);
            lineView.setAttributeNS(null, "y1", startY);
            lineView.setAttributeNS(null, "x2", endX);
            lineView.setAttributeNS(null, "y2", endY);
            lineView.setAttributeNS(null, "style", "stroke:rgb(0,0,0);stroke-width:3");
            mask.appendChild(lineView);

        }
        defsView.appendChild(mask);
        this.progressSvg.appendChild(defsView);

        let circumference = (this.innerRadius + this.progressWidth / 2) * 2 * Math.PI;
        this.progressGridCircle = document.createElementNS(SVG_NS, 'circle');
        this.progressGridCircle.setAttributeNS(null, "r", this.innerRadius + this.progressWidth / 2);
        this.progressGridCircle.setAttributeNS(null, "stroke-width", this.progressWidth);
        this.progressGridCircle.setAttributeNS(null, "fill", "transparent");
        this.progressGridCircle.setAttributeNS(null, "cx", this.container.offsetWidth / 2);
        this.progressGridCircle.setAttributeNS(null, "cy", this.container.offsetHeight / 2);
        this.progressGridCircle.setAttributeNS(null, "stroke", this.inactiveProgressColor);
        this.progressGridCircle.setAttributeNS(null, "mask", "url(#mask" + this.id + ")");
        this.progressGridCircle.style.zIndex = 8;
        this.progressSvg.appendChild(this.progressGridCircle);


        this.progressSvgCircle = document.createElementNS(SVG_NS, 'circle');
        this.progressSvgCircle.classList.add('progress-circle');
        this.progressSvgCircle.setAttributeNS(null, "r", this.innerRadius + this.progressWidth / 2);
        this.progressSvgCircle.setAttributeNS(null, "stroke-width", this.progressWidth);
        this.progressSvgCircle.setAttributeNS(null, "fill", "transparent");
        this.progressSvgCircle.setAttributeNS(null, "cx", this.container.offsetWidth / 2);
        this.progressSvgCircle.setAttributeNS(null, "cy", this.container.offsetHeight / 2);
        this.progressSvgCircle.setAttributeNS(null, "stroke", this.activeProgressColor);
        this.progressSvgCircle.style.zIndex = 10;
        this.progressSvg.appendChild(this.progressSvgCircle);


        this.endDotSvgCircle = document.createElementNS(SVG_NS, 'circle');
        this.endDotSvgCircle.setAttributeNS(null, "fill", "#000000");
        this.endDotSvgCircle.setAttributeNS(null, "r", this.endDotRadius);
        this.progressSvg.appendChild(this.endDotSvgCircle);

    }


    drawProgressSvg() {
        let circumference = (this.innerRadius + this.progressWidth / 2) * 2 * Math.PI;
        this.progressSvgCircle.style.strokeDasharray = circumference + " " + circumference;
        const offset = circumference - (this.value / (this.maxValue - this.minValue)) * circumference;
        this.progressSvgCircle.style.strokeDashoffset = offset;
    }

    positionDotSvgCircle() {
        let middleAngle = ((this.value / (this.maxValue - this.minValue)) * TWO_PI) - HALF_PI
        let distance = this.innerRadius + this.progressWidth / 2;
        let offsetX = this.container.offsetWidth / 2;
        let offsetY = this.container.offsetHeight / 2;
        let x = distance * Math.cos(middleAngle) + offsetX;
        let y = distance * Math.sin(middleAngle) + offsetY;
        this.endDotSvgCircle.setAttributeNS(null, "cx", x);
        this.endDotSvgCircle.setAttributeNS(null, "cy", y);
    }

    drawGrid() {
        let ctx = this.gridCanvas.getContext("2d");
        let startDistance = this.progressInnerRadius - this.progressWidth / 2;
        let endDistance = this.progressInnerRadius + this.progressWidth / 2;
        let offsetX = this.container.offsetWidth / 2;
        let offsetY = this.container.offsetHeight / 2;
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < this.steps; i++) {
            let angle = ((i / this.steps) * TWO_PI) - HALF_PI;
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

