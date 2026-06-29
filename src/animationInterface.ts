import type { RibbonParams } from './geometry/ribbon';
import {type AnimationInput, type AnimationSetting } from './geometry/ribbonGroup';

type RibbonAnimationSettings = AnimationSetting<AnimationInput, RibbonParams>;

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
    settings: {
        width: () => 0,
        height: () => 0,
        r1: () => 0,
        r2: () => 0,
        phi: () => 0,
        theta: ({t}) => -20 * t
    }
}

const insideOut: AnimationPreset = {
    duration: 8,
    easingDuration: 4,
    settings: {
        width: () => 0,
        height: () => 0,
        r1: () => -12,
        r2: () => 0,
        phi: () => 0,
        theta: () => 0,
    }
}

const unwind: AnimationPreset = {
    duration: 8,
    easingDuration: 4,
    settings: {
        width: () => 0,
        height: () => 0,
        r1: () => 0,
        r2: () => 0,
        phi: ({t}) => -t * 8 * Math.PI,
        theta: () => 0
    }
}

const buldge: AnimationPreset = {
    duration: 2,
    easingDuration: .3,
    settings: {
        width: () => 0,
        height: () => 0,
        r1: () => 0,
        r2: ({t, time}) =>  Math.max(0 , -.3 + Math.sin(10 * (t + time))),
        phi: () => 0,
        theta: () => 0
    }
}

const gather: AnimationPreset = {
    duration: 3,
    easingDuration: 1.5,
    settings: {
        width: ({t, time}) => 0,
        height: ({t, time}) => 0,
        r1: ({}) => 0,
        r2: ({t}) => 0,
        phi: ({t, i}) => -.7 * (i * Math.PI / 2),
        theta: ({t}) => 0
    }
}

const pulse: AnimationPreset = {
    duration: 3,
    easingDuration: .3,
    settings: {
        width: ({t, time}) => .2 * Math.sin(10 * time + t * 20),
        height: ({t, time}) => .05 * (1 + Math.cos(10 * time + t * 20)),
        r1: ({}) => 0,
        r2: ({t}) => 0,
        phi: ({t, i}) => 0,
        theta: ({t}) => 0
    }
}

const base: RibbonAnimationSettings = {  
    width: ({}) => .4,
    height: ({}) => .25,
    r1: ({}) => 6,
    r2: ({t}) => 2.5 - (.35 * t * 2 * Math.PI),
    phi: ({t, i}) => t * 4 * 2 * Math.PI + (i * Math.PI / 2),
    theta: ({t}) => t * 2 * Math.PI * 1.5
};

export class AnimationInterface {
    private activePresets: ActiveAnimation[] = [];

    private options: AnimationPreset[] = [pierce, insideOut, unwind, buldge, gather, pulse];

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
            return this.easeInOutQuad((curDuration) / activePreset.preset.easingDuration);
        } else if (maxDuration - curDuration < activePreset.preset.easingDuration) {
            return this.easeInOutQuad((maxDuration - curDuration) / activePreset.preset.easingDuration);
        } else {
            return 1;
        }
    }

    private easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }
}