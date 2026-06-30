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

    private down(e: PointerEvent) {
        this.start = this.getInputPoint(e);
    };

    private up(e: PointerEvent) {
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
        this.activeCanvas.addEventListener("pointerdown",
            (e: PointerEvent) => this.down(e));
            
        this.activeCanvas.addEventListener("pointerup",
            (e: PointerEvent) => this.up(e));

        document.addEventListener("keydown",
            (e: KeyboardEvent) => this.keyPressed(e.key));
    }

    private getInputPoint(e: PointerEvent): Point {
        return {
            x: e.pageX,
            y: e.pageY
        };
    }
}