import Sprite from "./Sprite.js";
import {EffectConfig} from "../interfaces/EffectConfig.ts";
import {Position} from "../interfaces/Position.ts";

export default class Effect {

    static #instances: { [p: number]: Effect } = {};
    static #running: { [p: string]: Sprite[] } = {};

    id: number;
    sprite: Sprite;

    static async load(src: string) {
        try {
            const response = await fetch(src);
            const json: EffectConfig[] = await response.json();
            return new Promise<void>((resolve) => {
                Object.values(json).forEach((config) => {
                    new Effect(config);
                });
                window.addEventListener("run-effect", (event: any) => {
                    Effect.get(event.detail.effect).run(event.detail.position, event.detail.onCreature ?? false);
                });
                resolve();
            });
        } catch (error) {
            console.error("Error while loading effects:", error);
        }
    }

    constructor(config: EffectConfig) {
        Effect.#instances[config.id] = this;

        this.id = config.id;
        if (config.colors) {
            this.sprite = Sprite.get(config.sprite).clone();
            this.sprite.dye(config.colors);
        } else {
            this.sprite = Sprite.get(config.sprite);
        }
    }

    static get(id: number): Effect {
        const effect: Effect = Effect.#instances[id];
        if (!effect) throw `Could not load effect for item ${id}.`;

        return effect;
    }

    static getRunning(position: Position) {
        return Effect.#running[JSON.stringify(position)] ?? [];
    }

    run(position: Position, onCreature: boolean = false) {
        const positionString = JSON.stringify(position);
        const sprite = this.sprite.clone();

        if (!Effect.#running[positionString]) {
            Effect.#running[positionString] = [];
        }
        sprite.customData = {onCreature: onCreature};

        Effect.#running[positionString].push(sprite);
        sprite.play().then(() => {
            Effect.#running[positionString] = Effect.#running[positionString].filter((item) => item != sprite);
            if (Effect.#running[positionString].length === 0) {
                delete Effect.#running[positionString];
            }
        });
    }
}
