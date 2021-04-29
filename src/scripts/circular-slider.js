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
    CURSOR_IDENTIFIER = "cursor";
    idToEventListener = {}
    centerPointToListOfEventListeners = {}
    activeEventListeners = {};
    resizeObserver = undefined;
    onResizeCallbacks = [];

    constructor() {
        this.init();
    }

    registerEventListener(id, centerPoint, innerRadius, outerRadius, pointerTouchEventCallback, resizeEventCallback) {
        let eventListener = new EventsListener(id, centerPoint, innerRadius, outerRadius, pointerTouchEventCallback);
        this.onResizeCallbacks.push(resizeEventCallback);
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


    init() {
        document.addEventListener("DOMContentLoaded", (event) => {
            this.resizeObserver = new ResizeObserver(entries => {
                for (let i = 0; i < this.onResizeCallbacks.length; i++) {
                    this.onResizeCallbacks[i]();
                }
            });
            this.resizeObserver.observe(document.body);
        });

        document.addEventListener("mousedown", (event) => {
            this.handleStartTouchCursorEvent(event, this.CURSOR_IDENTIFIER, event.clientX, event.clientY);
        });
        document.addEventListener("mousemove", (event) => {
            this.handleMoveTouchCursorEvent(event, this.CURSOR_IDENTIFIER, event.clientX, event.clientY);
        });
        document.addEventListener("mouseleave", (event) => {
            this.handleEndTouchCursorEvent(event, this.CURSOR_IDENTIFIER);
        });
        document.addEventListener("mouseup", (event) => {
            this.handleEndTouchCursorEvent(event, this.CURSOR_IDENTIFIER);
        });
        document.addEventListener("touchstart", (event) => {
            for (let i = 0; i < event.touches.length; i++) {
                this.handleStartTouchCursorEvent(event, event.touches[i].identifier, event.touches[i].clientX, event.touches[i].clientY);
            }
        }, {passive: false});
        document.addEventListener("touchmove", (event) => {
            for (let i = 0; i < event.touches.length; i++) {
                this.handleMoveTouchCursorEvent(event, event.touches[i].identifier, event.touches[i].clientX, event.touches[i].clientY);
            }
        }, {passive: false});
        document.addEventListener("touchcancel", (event) => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                this.handleEndTouchCursorEvent(event, event.changedTouches[i].identifier);
            }
        }, {passive: false});
        document.addEventListener("touchend", (event) => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                this.handleEndTouchCursorEvent(event, event.changedTouches[i].identifier);
            }
        }, {passive: false});
    }

    handleStartTouchCursorEvent(event, identifier, clientX, clientY) {
        for (let centerPoint in this.centerPointToListOfEventListeners) {
            let eventListeners = this.centerPointToListOfEventListeners[centerPoint];
            for (let i = 0; i < eventListeners.length; i++) {
                let eventListener = eventListeners[i];
                let distance = Math.sqrt(Math.pow((clientX - eventListener.centerPoint.x), 2) + Math.pow((clientY - eventListener.centerPoint.y), 2));
                if (distance >= eventListener.innerRadius && distance <= eventListener.outerRadius) {
                    this.activeEventListeners[identifier] = eventListener;
                    event.preventDefault();
                    this.processActiveTouchEvent(identifier, clientX, clientY);
                    break;
                }
            }
        }

    }

    handleMoveTouchCursorEvent(event, identifier, clientX, clientY) {
        if (this.activeEventListeners[identifier]) {
            event.preventDefault();
            this.processActiveTouchEvent(identifier, clientX, clientY);
        }
    }

    handleEndTouchCursorEvent(event, identifier) {
        if (this.activeEventListeners[identifier]) {
            event.preventDefault();
            delete this.activeEventListeners[identifier];
        }
    }

    processActiveTouchEvent(identifier, clientX, clientY) {
        let centerX = this.activeEventListeners[identifier].centerPoint.x;
        let centerY = this.activeEventListeners[identifier].centerPoint.y;
        let angle = Math.atan2(clientY - centerY, clientX - centerX);
        angle = angle + HALF_PI;
        if (angle < 0) {
            angle = angle + TWO_PI;
        }
        let anglePercentage = angle / TWO_PI;
        this.activeEventListeners[identifier].callback(anglePercentage);
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
    endDotRadius = 11;
    progressWidth = 18;
    lockRadius = false;

    offsetTop = 0;
    offsetLeft = 0;
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
        this.calculateNotContainerRelatedStuff();
        this.createViews();
        this.increaseContainerSizeIfNeeded();
        this.calculateContainerRelatedStuff();
        this.positionMainView();
        this.drawProgressDot();


        CircularSlider.eventHandler.registerEventListener(
            this.id,
            this.absoluteCenterPoint,
            this.innerRadius,
            this.outerRadius,
            this.onPointerTouchEvent,
            this.onViewResized);
    }

    onPointerTouchEvent = (anglePercentage) => {
        let step = Math.ceil(anglePercentage * this.steps);
        this.value = step * (this.maxValue - this.minValue) / this.steps;
        if (this.callback) {
            this.callback(this.value);
        }
        this.drawProgressDot();
    }

    onViewResized = () => {
        this.calculateContainerRelatedStuff();
        this.positionMainView();
        this.updateEventListener();
    }


    setCallback(callback) {
        this.callback = callback;
    }


    positionMainView() {
        this.circularSliderViewSvg.style.top = `${this.offsetTop}`;
        this.circularSliderViewSvg.style.left = `${this.offsetLeft}`;
    }

    updateEventListener() {
        CircularSlider.eventHandler.updateCenterPointOfEventListener(this.id, this.absoluteCenterPoint);
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

    calculateNotContainerRelatedStuff() {
        this.valueRangeSize = Math.abs(this.maxValue - this.minValue);
        this.steps = this.valueRangeSize / this.step;
        this.activeProgressColorEnd = shadeColor(this.activeProgressColorStart, 200);
        this.circumference = this.radius * TWO_PI;
        this.innerRadius = this.radius - this.progressWidth / 2;
        this.outerRadius = this.radius + this.progressWidth / 2;


        this.height = this.width = (this.innerRadius + Math.max(this.endDotRadius * 2, this.progressWidth)) * 2;
        this.relativeCenterPoint = new Point(
            this.width / 2,
            this.height / 2
        );
    }

    increaseContainerSizeIfNeeded() {
        let containerBoundingRect = this.container.getBoundingClientRect();
        if (containerBoundingRect.width < this.width) {
            this.container.style.width = this.width + "px";
        }
        if (containerBoundingRect.height < this.height) {
            this.container.style.height = this.height + "px";
        }
    }

    calculateContainerRelatedStuff() {
        const containerBoundingRect = this.container.getBoundingClientRect();
        this.offsetTop = (containerBoundingRect.height - this.height) / 2;
        this.offsetLeft = (containerBoundingRect.width - this.width) / 2;

        this.absoluteCenterPoint = new Point(
            this.relativeCenterPoint.x + containerBoundingRect.x + this.offsetLeft,
            this.relativeCenterPoint.y + containerBoundingRect.y + this.offsetTop
        );
    }


    createViews() {
        this.circularSliderViewSvg = document.createElementNS(SVG_NS, 'svg');
        this.circularSliderViewSvg.setAttribute("width", this.width);
        this.circularSliderViewSvg.setAttribute("height", this.height);
        this.circularSliderViewSvg.classList.add("circular-slider");
        this.container.appendChild(this.circularSliderViewSvg);

        let defsView = document.createElementNS(SVG_NS, 'defs');
        let mask = document.createElementNS(SVG_NS, 'mask');
        mask.setAttribute("id", "mask" + this.id);
        mask.setAttribute("maskUnits", "userSpaceOnUse");

        let rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", this.width);
        rect.setAttribute("height", this.height);
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


        // TODO make something more similar to the conic gradient, probably with path instead of circle :/

        let linearGradient = document.createElementNS(SVG_NS, 'linearGradient');
        linearGradient.setAttribute("id", "gradient" + this.id);
        linearGradient.setAttribute("x1", "0%");
        linearGradient.setAttribute("y1", "0%");
        linearGradient.setAttribute("x2", "100%");
        linearGradient.setAttribute("y2", "0%");

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

