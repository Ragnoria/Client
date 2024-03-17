import {BOARD_HEIGHT, BOARD_WIDTH, DEVICE_BREAKPOINT, SCALE_DESKTOP, SCALE_MOBILE, TILE_SIZE} from "../config.js";
import {isSamePosition} from "../utils/position.ts";
import Pointer from "./Pointer.js";
import Sprite from "./Sprite.js";
import Board from "./Board.js";
import {$hero} from "../utils/globals.ts";
import Effect from "./Effect.ts";
import {randomString} from "../utils/common.ts";

export default class Renderer {

    static ctx = null;
    static tempCtx = null;
    static hudCtx = null;
    static scale = window.innerWidth <= DEVICE_BREAKPOINT ? SCALE_MOBILE : SCALE_DESKTOP;
    static texts = {};

    static init() {
        const canvas = document.createElement('canvas');
        canvas.id = 'board';
        canvas.width = TILE_SIZE * BOARD_WIDTH;
        canvas.height = TILE_SIZE * BOARD_HEIGHT;
        canvas.style.transform = 'scale(' + Renderer.scale + ')';
        document.querySelector('#app').append(canvas);

        const hud = document.createElement('canvas');
        hud.id = 'hud';
        hud.width = TILE_SIZE * BOARD_WIDTH * Renderer.scale;
        hud.height = TILE_SIZE * BOARD_HEIGHT * Renderer.scale;
        document.querySelector('#app').append(hud);

        const temp = document.createElement('canvas');
        temp.width = TILE_SIZE * BOARD_WIDTH;
        temp.height = TILE_SIZE * BOARD_HEIGHT;

        Renderer.ctx = canvas.getContext("2d", {alpha: false});
        Renderer.ctx.fillStyle = '#25131a';
        Renderer.hudCtx = hud.getContext("2d");
        Renderer.tempCtx = temp.getContext("2d");
        Renderer.tempCtx.fillStyle = '#25131a';

        window.addEventListener("resize", Renderer.onResize);

        Renderer.render();
    }

    static render() {
        Renderer.tempCtx.fillRect(0, 0, Renderer.tempCtx.canvas.width, Renderer.tempCtx.canvas.height);
        Renderer.hudCtx.clearRect(0, 0, Renderer.hudCtx.canvas.width, Renderer.hudCtx.canvas.height);

        for (let layer of ['ground', 'objects']) {
            let y = 0;
            for (let [sy, row] of Object.entries(Board.tiles)) {
                let x = 0;
                for (let [sx, tile] of Object.entries(row)) {
                    const positionClient = {x: x, y: y};
                    const positionServer = {x: Number(sx), y: Number(sy)};
                    Renderer.renderTile(positionClient, positionServer, layer, tile);
                    x++;
                }
                y++;
            }
        }
        Renderer.renderTexts();
        Renderer.renderPointerEffect();
        Renderer.ctx.drawImage(Renderer.tempCtx.canvas, -$hero.offset.x, -$hero.offset.y);

        window.requestAnimationFrame(Renderer.render);
    }

    static renderTile(positionClient, positionServer, layer, tile) {
        if (layer === 'ground') {
            tile.filter((item) => item.getType() === 'ground').forEach((item) => {
                Renderer.drawSprite(positionClient, item.getSprite());
            });
            return;
        }

        if (layer === 'objects') {
            let altitude = 0;
            tile.filter((item) => item.getType() !== 'ground').forEach((item) => {
                Renderer.drawSprite(positionClient, item.getSprite(), altitude);
                altitude += item.getAltitude();
            });

            Object.values(Board.creatures)
            .filter((creature) => isSamePosition(positionServer, creature.position))
            .forEach((creature) => {
                Renderer.drawCreature(positionClient, creature, altitude);
                Renderer.drawNickname(positionClient, creature, altitude);
                Renderer.drawHealthBar(positionClient, creature, altitude);
            });

            Effect.getRunning(positionServer).forEach((sprite) => {
                if (sprite.customData.onCreature ?? false) {
                    Renderer.drawSprite(positionClient, sprite, altitude + Math.ceil(TILE_SIZE / 8));
                } else {
                    Renderer.drawSprite(positionClient, sprite, altitude);
                }
            });
            return;
        }
    }

    static drawSprite(position, sprite, altitude = 0) {
        const image = sprite.getFrame();
        const top = (position.y * TILE_SIZE) + (TILE_SIZE - image.height) - altitude;
        const left = (position.x * TILE_SIZE) + (Math.ceil(TILE_SIZE / 2) - Math.ceil(image.width / 2));
        Renderer.tempCtx.drawImage(image, left, top);
    }

    static drawCreature(position, creature, altitude = 0) {
        const image = creature.sprite.getFrame();
        const top = (position.y * TILE_SIZE) + (TILE_SIZE - image.height) - Math.ceil(TILE_SIZE / 8) + creature.offset.y - altitude;
        const left = (position.x * TILE_SIZE) + (Math.ceil(TILE_SIZE / 2) - Math.ceil(image.width / 2)) + creature.offset.x;
        Renderer.tempCtx.drawImage(image, left, top);
    }

    static drawNickname(position, creature, altitude = 0) {
        let top = (position.y * TILE_SIZE) - altitude;
        let left = position.x * TILE_SIZE;
        if (!creature.isHero()) {
            left = left - ($hero.offset.x - creature.offset.x);
            top = top - ($hero.offset.y - creature.offset.y);
        }
        top *= Renderer.scale;
        left *= Renderer.scale;

        Renderer.hudCtx.fillStyle = "#dce1e3";
        Renderer.hudCtx.strokeStyle = "#000000";
        Renderer.hudCtx.font = "15px Hind Vadodara";
        Renderer.hudCtx.lineWidth = 2;

        top = top - (26 * Renderer.scale);
        left = left + ((TILE_SIZE * Renderer.scale) / 2) - Math.ceil(Renderer.hudCtx.measureText(creature.name).width / 2);
        Renderer.hudCtx.strokeText(creature.name, left, top);
        Renderer.hudCtx.fillText(creature.name, left, top);
    }

    static drawHealthBar(position, creature, altitude = 0) {
        const image = Sprite.get('hp-bar').getFrame();
        let top = (position.y * TILE_SIZE) - altitude;
        let left = position.x * TILE_SIZE;
        if (!creature.isHero()) {
            left = left - ($hero.offset.x - creature.offset.x);
            top = top - ($hero.offset.y - creature.offset.y);
        }
        top *= Renderer.scale;
        left *= Renderer.scale;

        top = top - (23 * Renderer.scale);
        left = left + ((TILE_SIZE * Renderer.scale) / 2) - Math.ceil(image.width / 2);
        Renderer.hudCtx.fillStyle = "#000000";
        Renderer.hudCtx.globalAlpha = 0.5;
        Renderer.hudCtx.fillRect(left - 1, top - 1, image.width + 2, image.height + 2);
        Renderer.hudCtx.globalAlpha = 1;
        Renderer.hudCtx.drawImage(image, left, top, Math.ceil(image.width * creature.healthPercent / 100), image.height);
    }

    static renderTexts() {
        Renderer.hudCtx.font = "bold 18px Hind Vadodara";
        Renderer.hudCtx.lineWidth = 2;

        for (let text of Object.values(Renderer.texts)) {
            const position = Board.positionServerToClient(text.position);
            const top = ((position.y * TILE_SIZE - $hero.offset.y) * Renderer.scale) + text.offset.y;
            let left = ((position.x * TILE_SIZE - $hero.offset.x) * Renderer.scale) + text.offset.x;
            left = left + ((TILE_SIZE * Renderer.scale) / 2) - Math.ceil(Renderer.hudCtx.measureText(text.content).width / 2);
            Renderer.hudCtx.fillStyle = text.color;
            Renderer.hudCtx.strokeText(text.content, left, top);
            Renderer.hudCtx.fillText(text.content, left, top);
        }
    }

    static renderPointerEffect() {
        if (!Pointer.effect) return;

        const image = Pointer.effect.sprite.getFrame();
        const position = Pointer.effect.position;
        const offset = $hero.offset;
        Renderer.tempCtx.drawImage(image, position.x + offset.x - (image.width / 2), position.y + offset.y - (image.height / 2));
    }

    static addFloatingText(content, color) {
        const uid = randomString(8);

        Renderer.texts[uid] = {
            position: {...$hero.position},
            content: content,
            offset: {x: 0, y: -(TILE_SIZE / 2)},
            color: color,
            iteration: 0
        };
        const interval = setInterval(() => {
            Renderer.texts[uid].offset.y--;
            Renderer.texts[uid].iteration++;
            if (Renderer.texts[uid].iteration >= 30) {
                delete Renderer.texts[uid];
                clearInterval(interval);
            }
        }, 25);
    }

    static onResize() {
        const scale = window.innerWidth <= DEVICE_BREAKPOINT ? SCALE_MOBILE : SCALE_DESKTOP;
        if (Renderer.scale !== scale) {
            Renderer.scale = scale;
            Renderer.ctx.canvas.style.transform = 'scale(' + Renderer.scale + ')';
            Renderer.hudCtx.canvas.width = TILE_SIZE * BOARD_WIDTH * Renderer.scale;
            Renderer.hudCtx.canvas.height = TILE_SIZE * BOARD_HEIGHT * Renderer.scale;
        }
    }
}
