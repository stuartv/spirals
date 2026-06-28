import type { RibbonParams } from './geometry/ribbon';
import {type AnimationInput, type AnimationSetting } from './geometry/ribbonGroup';

type RibbonAnimationSettings = AnimationSetting<AnimationInput, RibbonParams>;

type AnimationPreset = {
    duration: number;
    settings: RibbonAnimationSettings;
};

type ActiveAnimation = {
    startTime: number;
    preset: AnimationPreset;
}

const pulse: AnimationPreset = {
    duration: 3,
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
    r2: ({}) => 2.5,
    phi: ({t, i}) => t * 4 * 2 * Math.PI + (i * Math.PI / 2),
    theta: ({t}) => t * 2 * Math.PI * 1.5
};

export class AnimationInterface {
    private activePresets: ActiveAnimation[] = [];

    add(curTime: number): void {
        this.activePresets.push({
            startTime: curTime,
            preset: pulse
        });
    }

    calculateSettings(curTime: number): RibbonAnimationSettings {
        // Cull expired animations
        this.activePresets = this.activePresets.filter((animation) => 
            animation.startTime + animation.preset.duration > curTime);

        return this.activePresets
            .map(preset => preset.preset.settings)
            .reduce((combined, preset) => {
                return {
                    width: (input) => combined.width(input) + preset.width(input),
                    height: (input) => combined.height(input) + preset.height(input),
                    r1: (input) => combined.r1(input) + preset.r1(input),
                    r2: (input) => combined.r2(input) + preset.r2(input),
                    phi: (input) => combined.phi(input) + preset.phi(input),
                    theta: (input) => combined.theta(input) + preset.theta(input)
                };
            },base);
    }
}