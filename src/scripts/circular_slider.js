class CircularSlider {
    container = undefined;
    canvas = undefined;
    color = 0xFFFF00;
    minValue = 0;
    maxValue = 100;
    step = 10;
    radius = 30;

    constructor(container) {
        this.container = container;
        this.insertCanvas();
        this.draw();
    }

    insertCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "CursorLayer";
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.canvas.style.zIndex = 8;
        this.canvas.style.position = "absolute";
        this.canvas.style.border = "1px solid";
        this.container.appendChild(this.canvas)
    }

    draw() {
        console.log("draw method");
        let ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
