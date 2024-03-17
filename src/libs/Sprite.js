import {dye, loadImage} from "../utils/gfx.ts";

export default class Sprite {

    static #instances = {};

    id = null;
    image = null;
    originImage = null;
    mask = null;
    speed = null;
    states = null;
    canvas = null;
    ctx = null;
    interval = null;
    currentState = null;
    currentFrame = null;
    lastFrame = null;
    customData = {};

    static async load(src) {
        try {
            const response = await fetch(src);
            const json = await response.json();
            await Promise.all(Object.entries(json).map(async ([id, data]) => {
                const image = await loadImage(data.base);
                const spriteOptions = {
                    image: image,
                    speed: data.speed || null,
                    states: data.states || null
                };

                if (data.mask) {
                    spriteOptions.mask = await loadImage(data.mask);
                }

                new Sprite(id, spriteOptions);
            }));
        } catch (error) {
            console.error("Error loading sprites:", error);
        }
    }

    static get(id) {
        return Sprite.#instances[id] ?? null;
    }

    constructor(id, data) {
        if (id) {
            Sprite.#instances[id] = this;
        }

        this.id = id;
        this.image = data.image;
        this.originImage = data.image;
        this.mask = data.mask || null;
        this.speed = data.speed || null;
        this.states = data.states || {};
        this.states.origin = [{x: 0, y: 0, w: this.image.width, h: this.image.height}];
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.currentState = this.getDefaultState();
        this.currentFrame = 1;
    }

    clone() {
        return new Sprite(null, {
            originImage: this.originImage,
            image: this.image,
            mask: this.mask,
            speed: this.speed,
            states: this.states,
        })
    }

    async play(state = null) {
        return new Promise((resolve) => {
            state = state || this.getDefaultState();
            this.stop();
            this.rewind();
            this.currentState = state;

            const numberOfFrames = this.states[state].length;
            if (numberOfFrames > 1 && this.speed) {
                this.interval = setInterval(() => {
                    if (++this.currentFrame > numberOfFrames) {
                        this.stop();
                        resolve();
                    }
                }, this.speed);
            }
        });
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    rewind() {
        this.currentFrame = 1;
    }

    loop(state = null) {
        state = state || this.getDefaultState();

        if (this.interval && this.currentState === state) {
            return;
        }

        this.stop();
        this.rewind();
        this.currentState = state;

        const numberOfFrames = this.states[state].length;
        if (numberOfFrames > 1 && this.speed) {
            this.interval = setInterval(() => {
                if (++this.currentFrame > numberOfFrames) {
                    this.currentFrame = 1;
                }
            }, this.speed);
        }
    }

    async dye(colors) {
        this.image = await dye(this.originImage, this.mask, colors);
        this.lastFrame = null;
    }

    getDefaultState() {
        return Object.keys(this.states)[0];
    }

    getFrame() {
        const frame = this.states[this.currentState][this.currentFrame - 1];
        if (this.lastFrame === frame) {
            return this.canvas;
        }

        this.lastFrame = frame;
        this.canvas.width = frame.w;
        this.canvas.height = frame.h;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

        return this.canvas;
    }
}
