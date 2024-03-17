import Board from "./Board.js";
import Sprite from "./Sprite.js";
import Movement from "./Movement.js";
import {randomColor} from "../utils/gfx.ts";
import {$hero} from "../utils/globals.ts";

export default class Creature {

    name = null;
    position = {x: null, y: null};
    offset = {x: null, y: null}
    sprite = null;
    speed = 25; // 1 = 0.1 sqm/s
    healthPercent = 100;
    movement = {
        isMoving: false,
        currentFrame: 0,
        timeouts: []
    };

    constructor(name, position) {
        Board.creatures[name] = this;
        this.name = name;
        this.position = position;
        this.offset = {x: 0, y: 0};
        this.sprite = Sprite.get('outfit').clone()
        this.sprite.dye([randomColor(), randomColor(), randomColor(), randomColor()]);
        this.sprite.loop('idle-south');
    }

    isHero() {
        return this === $hero;
    }

    move(direction, position) {
        Movement.move(this, position, direction)
    }
}
