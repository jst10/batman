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
    nextListenerId = 0;
    idToEventListener = {}
    centerPointToListOfEventListeners = {}
    activeEventListener = undefined;

    constructor() {
        this.init();
    }

    registerEventListener(centerPoint, innerRadius, outerRadius, callback) {
        let eventListener = new EventsListener(CircularSlider.nextListenerId, centerPoint, innerRadius, outerRadius, callback);
        this.idToEventListener[eventListener.id] = eventListener;
        this.insertEventListenerIntoCenterPointDict(eventListener);
        return CircularSlider.nextListenerId++;
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
        angle = angle + 0.5 * Math.PI;
        if (angle < 0) {
            angle = angle + Math.PI * 2;
        }
        let anglePercentage = angle / (Math.PI * 2);
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
        document.addEventListener("mouseup", (event) => {
            this.activeEventListener = undefined;
        });
        document.addEventListener("mouseleave", (event) => {
            this.activeEventListener = undefined;
        });
    }
}


class CircularSlider {

    static eventHandler = new EventsHandler();

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

    id = undefined;
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


    centerPoint = undefined;
    innerRadius = undefined;
    outerRadius = undefined;


    // NOTE I make options optional, you do not need to provide them
    constructor(container, options) {
        this.container = container;
        this.gridColor = container.style.backgroundColor;
        this.setValuesFromOptions(options);
        this.createViews();
        this.calculateSomeStuff();
        this.id = CircularSlider.eventHandler.registerEventListener(this.centerPoint, this.innerRadius, this.outerRadius, (anglePercentage) => {
            let step = Math.ceil(anglePercentage * this.steps);
            this.value = step * (this.maxValue - this.minValue) / this.steps;
            this.drawProgress();
        })

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
        this.centerPoint = new Point(
            this.progressCanvas.width / 2 + this.container.offsetLeft,
            this.progressCanvas.height / 2 + this.container.offsetTop
        );
        this.innerRadius = this.progressInnerRadius - this.progressWidth / 2;
        this.outerRadius = this.progressInnerRadius + this.progressWidth / 2;
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

