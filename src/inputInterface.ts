type Point = {
    x: number;
    y: number;
}

export type HandlerFunction = (arg: Point) => void;

export class InputInterface {
    private activeCanvas: HTMLCanvasElement;
    private start: Point = {x:0, y:0};

    constructor(activeCanvas: HTMLCanvasElement) {
        this.activeCanvas = activeCanvas;
        this.createEventTranslations();
    }

    private down(e: MouseEvent | TouchEvent) {
        this.start = this.getInputPoint(e);
    };

    private up(e: MouseEvent | TouchEvent) {
        const end = this.getInputPoint(e);
        const amountMoved =
            Math.abs(end.x - this.start.x) +
            Math.abs(end.y - this.start.y);

        if (amountMoved < 10) {
            console.log('count it as a click'!);
        } else {
            console.log('what a drag');
        }
    };

    private createEventTranslations() {
        this.activeCanvas.addEventListener("mousedown",
            (e: MouseEvent) => this.down(e));

        this.activeCanvas.addEventListener("touchstart",
            (e: TouchEvent) => this.down(e));
            
        this.activeCanvas.addEventListener("mouseup",
            (e: MouseEvent) => this.up(e));

        this.activeCanvas.addEventListener("touchend",
            (e: TouchEvent) => this.up(e));
    }

    private getInputPoint(e: MouseEvent | TouchEvent): Point {
        let mouseX = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0]?.pageX :
            (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
            (e as TouchEvent).changedTouches[0]?.pageY :
            (e as MouseEvent).pageY;

        return {
            x: mouseX ?? 0,
            y: mouseY ?? 0
        };
    }
}