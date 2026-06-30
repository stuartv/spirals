type Point = {
    x: number;
    y: number;
}

export type HandlerFunction = (arg: Point) => void;

export class InputInterface {
    private clickEvent: () => void = () => {};

    private keyPressEvents: Record<string, () => void> = {};

    private activeCanvas: HTMLCanvasElement;
    private start: Point = {x:0, y:0};

    constructor(activeCanvas: HTMLCanvasElement) {
        this.activeCanvas = activeCanvas;
        this.createEventTranslations();
    }

    registerClickEvent(event: () => void) {
        this.clickEvent = event;
    }

    registerKeyPress(key: string, event: () => void) {
        this.keyPressEvents[key] = event;
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
            this.clickEvent();
        }
    };

    private keyPressed(key: string) {
        this.keyPressEvents[key]?.();
    }

    private createEventTranslations() {
        this.activeCanvas.addEventListener("mousedown",
            (e: MouseEvent) => this.down(e));

        this.activeCanvas.addEventListener("touchstart",
            (e: TouchEvent) => this.down(e));
            
        this.activeCanvas.addEventListener("mouseup",
            (e: MouseEvent) => this.up(e));

        this.activeCanvas.addEventListener("touchend",
            (e: TouchEvent) => this.up(e));

        document.addEventListener("keydown",
            (e: KeyboardEvent) => this.keyPressed(e.key));
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