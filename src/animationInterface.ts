import type { RibbonParams } from './geometry/ribbon';
import {type AnimationInput, type AnimationSetting } from './geometry/ribbonGroup';

export type RibbonAnimationSettings = AnimationSetting<AnimationInput, RibbonParams>;
type SparseRibbonAnimationSettings = AnimationSetting<AnimationInput, Partial<RibbonParams>>;

type AnimationPreset = {
    duration: number;
    easingDuration: number;
    settings: RibbonAnimationSettings;
};

type ActiveAnimation = {
    startTime: number;
    preset: AnimationPreset;
}

const pierce: AnimationPreset = {
    duration: 8,
    easingDuration: 4,
    settings: build({
        theta: ({t}) => -20 * t
    })
}

const insideOut: AnimationPreset = {
    duration: 4,
    easingDuration: 2,
    settings: build({
        r1: ({t, time}) => .5 * Math.sin(10 * (3*t + time))
    })
}

const wind: AnimationPreset = {
    duration: 4,
    easingDuration: 2,
    settings: build({
        phi: ({t}) => 30 * t
    })
}

const buldge: AnimationPreset = {
    duration: 2,
    easingDuration: .3,
    settings: build({
        r2: ({t, time}) =>  Math.max(0 , -.3 + Math.sin(10 * (t + time)))
    })
}

const gather: AnimationPreset = {
    duration: 3,
    easingDuration: 1.5,
    settings: build({
        phi: ({i}) => -.7 * (i * Math.PI / 2)
    })
}

const pulse: AnimationPreset = {
    duration: 3,
    easingDuration: .3,
    settings: build({
        width: ({t, time}) => .2 * Math.sin(10 * time + t * 20),
        height: ({t, time}) => .05 * (1 + Math.cos(10 * time + t * 20))
    })
}

const base: RibbonAnimationSettings = {  
    width: () => .4,
    height: () => .25,
    r1: () => 6,
    r2: ({t}) => 2.5 * (1 - t),
    phi: ({t, i}) => t * 8 * Math.PI + (i * Math.PI / 2),
    theta: ({t}) => t * 2 * Math.PI * 1.3 + Math.PI
};

function build(input: SparseRibbonAnimationSettings): RibbonAnimationSettings {
    const defaultFunction = () => 0;
    return {
        width: (input.width as RibbonAnimationSettings['width']) ?? defaultFunction,
        height: (input.height as RibbonAnimationSettings['height']) ?? defaultFunction,
        r1: (input.r1 as RibbonAnimationSettings['r1']) ?? defaultFunction,
        r2: (input.r2 as RibbonAnimationSettings['r2']) ?? defaultFunction,
        phi: (input.phi as RibbonAnimationSettings['phi']) ?? defaultFunction,
        theta: (input.theta as RibbonAnimationSettings['theta']) ?? defaultFunction,
    };
}

export class AnimationInterface {
    private activePresets: ActiveAnimation[] = [];
    private options: AnimationPreset[] = [pierce, insideOut, wind, buldge, gather, pulse];

    getTotalPresets(): number {
        return this.options.length;
    }

    addSpecific(key: number, curTime: number): void {
        const chosen = this.options[key]!;

        this.activePresets.push({
            startTime: curTime,
            preset: chosen
        });
    }

    add(curTime: number): void {
        const chosen = this.options[
            Math.floor(Math.random() * this.options.length)
        ]!;

        this.activePresets.push({
            startTime: curTime,
            preset: chosen
        });
    }

    calculateSettings(curTime: number): RibbonAnimationSettings {
        // Cull expired animations
        this.activePresets = this.activePresets.filter((animation) => 
            animation.startTime + animation.preset.duration > curTime);

        return this.activePresets
            .reduce((combined, activePreset) => {
                
                const preset = activePreset.preset.settings;
                const curDuration = curTime - activePreset.startTime;
                const e = this.getEasingFactor(activePreset, curDuration);
                
                return {
                    width: (input) => combined.width(input) + e * preset.width(input),
                    height: (input) => combined.height(input) + e * preset.height(input),
                    r1: (input) => combined.r1(input) + e * preset.r1(input),
                    r2: (input) => combined.r2(input) + e * preset.r2(input),
                    phi: (input) => combined.phi(input) + e * preset.phi(input),
                    theta: (input) => combined.theta(input) + e * preset.theta({...input, time: curDuration})
                };
            },base);
    }

    private getEasingFactor(activePreset: ActiveAnimation, curDuration: number): number {        
        const maxDuration = activePreset.preset.duration;

        if (curDuration < activePreset.preset.easingDuration){
            return easeInOutQuad((curDuration) / activePreset.preset.easingDuration);
        } else if (maxDuration - curDuration < activePreset.preset.easingDuration) {
            return easeInOutQuad((maxDuration - curDuration) / activePreset.preset.easingDuration);
        } else {
            return 1;
        }
    }

    
}

function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}