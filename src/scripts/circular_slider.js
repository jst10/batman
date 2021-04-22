class CircularSlider {
    container = undefined;
    canvas = undefined;
    color = "#F00FFF";
    minValue = 0;
    maxValue = 100;
    step = 10;
    radius = 170;
    settingMode = false;

    constructor(container) {
        this.container = container;
        this.insertCanvas();
        this.initListeners();
        this.draw();
    }

    initListeners() {
        this.canvas.addEventListener("mousemove", (event) => {
            let cursorX = event.clientX - this.container.offsetLeft;
            let cursorY = event.clientY - this.container.offsetTop;
            console.log(cursorX + "/" + cursorY);
        });
        this.canvas.addEventListener("mousedown", (event) => {
            console.log("mouse mousedown")
        });
        this.canvas.addEventListener("mouseup", (event) => {
            console.log("mouse mouseup")
        });
        this.canvas.addEventListener("mouseleave", (event) => {
            console.log("mouse mouseleave")
        });

    }


    insertCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "CursorLayer";
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.canvas.style.zIndex = 8;
        this.canvas.style.position = "relative";
        this.canvas.style.border = "1px solid";
        this.container.appendChild(this.canvas)
    }

    draw() {
        console.log("draw method");
        let ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 25;
        ctx.stroke();
    }
}
