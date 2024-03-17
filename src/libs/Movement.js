import {TILE_SIZE} from "../config.js";
import Board from "./Board.js";
import * as EasyStar from "easystarjs";
import {isPositionInRange, isSamePosition} from "../utils/position.ts";
import Pointer from "./Pointer.js";
import {$hero} from "../utils/globals.ts";
import WebsocketRequest from "./WebsocketRequest.js";
import {emit} from "../utils/common.ts";
import SoundEffect from "./SoundEffect.js";

export default class Movement {

    static queuedMove = null;
    static easyStar = null;
    static path = null;
    static isBlocked = false;

    static init() {
        Movement.easyStar = new EasyStar.js()
        window.addEventListener("move-north", () => {
            Movement.clearPath();
            Movement.walk('north')
        });
        window.addEventListener("move-south", () => {
            Movement.clearPath();
            Movement.walk('south')
        });
        window.addEventListener("move-west", () => {
            Movement.clearPath();
            Movement.walk('west')
        });
        window.addEventListener("move-east", () => {
            Movement.clearPath();
            Movement.walk('east')
        });
    }

    static walk(direction) {
        if (Movement.isBlocked) {
            return false;
        }

        if ($hero.movement.isMoving) {
            if ($hero.movement.currentFrame > (TILE_SIZE - (TILE_SIZE/3))) {
                Movement.queuedMove = direction;
                return true;
            }
            return false;
        }

        const targetPosition = Movement.getTargetPosition($hero, direction);
        if (!Board.isWalkable(targetPosition)) {
            $hero.sprite.loop('idle-' + direction);
            return false;
        }

        Movement.move($hero, targetPosition, direction);

        return true;
    }

    static move(creature, position, direction) {
        SoundEffect.play('footstep');
        creature.movement.timeouts.forEach((timeout) => clearTimeout(timeout));
        creature.movement.timeouts = [];
        creature.currentFrame = 0;
        creature.offset = {x: 0, y: 0};
        creature.movement.isMoving = true;
        for (let i = 0; i < TILE_SIZE; i++) {
            const timeout = setTimeout(() => {
                Movement.handleMovingFrame(creature, position, direction)
            }, (10000 / creature.speed / TILE_SIZE) * i);
            creature.movement.timeouts.push(timeout);
        }
    }

    static handleMovingFrame(creature, position, direction) {
        creature.sprite.loop('walk-' + direction);
        creature.movement.currentFrame++;
        Movement.updateOffsetAfterAnimationFrameChange(creature, direction);
        if (creature.movement.currentFrame === (TILE_SIZE / 2)) {
            creature.position = position;
            emit('hero-position-changed');
            Movement.updateOffsetAfterPositionChange(creature, direction);
        }
        if (creature.movement.currentFrame === TILE_SIZE) {
            creature.movement.isMoving = false;
            creature.movement.currentFrame = 0;
            creature.movement.timeouts.forEach((timeout) => clearTimeout(timeout));
            creature.movement.timeouts = [];
            if (creature.isHero() && Movement.queuedMove) {
                direction = Movement.queuedMove;
                Movement.queuedMove = null;
                if (Movement.walk(direction)) return;
            }
            if (Movement.path) {
                if (isSamePosition(Movement.path.destination, position)) {
                    Movement.clearPath();
                } else {
                    Movement.makePathStep();
                    return
                }
            }
            creature.sprite.loop('idle-' + direction);
        }
    }

    static getDirection(position1, position2) {
        if (position1.x < position2.x) {
            return 'east';
        }
        if (position1.x > position2.x) {
            return 'west';
        }
        if (position1.y > position2.y) {
            return 'north';
        }
        if (position1.y < position2.y) {
            return 'south';
        }
    }

    static getTargetPosition(creature, direction) {
        const map = {
            'north': {x: 0, y: -1},
            'south': {x: 0, y: 1},
            'west': {x: -1, y: 0},
            'east': {x: 1, y: 0}
        };

        return {
            x: creature.position.x + map[direction].x,
            y: creature.position.y + map[direction].y
        };
    }

    static updateOffsetAfterAnimationFrameChange(creature, direction) {
        const map = {
            'north': () => creature.offset.y--,
            'south': () => creature.offset.y++,
            'west': () => creature.offset.x--,
            'east': () => creature.offset.x++
        }
        map[direction]();
    }

    static updateOffsetAfterPositionChange(creature, direction) {
        const map = {
            'north': () => creature.offset.y = (TILE_SIZE / 2),
            'south': () => creature.offset.y = -(TILE_SIZE / 2),
            'west': () => creature.offset.x = (TILE_SIZE / 2),
            'east': () => creature.offset.x = -(TILE_SIZE / 2)
        }
        map[direction]();
    }

    static clearPath() {
        Movement.path = null;
    }

    static setPath(destination, action, actionData = null) {
        Movement.path = {
            destination: {...destination},
            action: action,
            actionData: actionData
        }
        if (!$hero.movement.isMoving) {
            Movement.makePathStep();
        }
    }

    static makePathStep() {
        if (!Movement.path || isSamePosition(Movement.path.destination, $hero.position)) {
            Movement.path = null;
            $hero.sprite.loop('idle-south');
            return;
        }

        const grid = [];
        const startPosition = Board.positionServerToClient($hero.position);
        const endPosition = Board.positionServerToClient(Movement.path.destination);

        // prepare collisions grid
        for (let y = Board.firstTilePosition.y; y <= Board.lastTilePosition.y; y++) {
            const row = [];
            for (let x = Board.firstTilePosition.x; x <= Board.lastTilePosition.x; x++) {
                const position = {x: x, y: y};
                let isWalkable = isSamePosition(Movement.path.destination, position) ? true : Board.isWalkable(position);
                row.push(Number(isWalkable));
            }
            grid.push(row);
        }

        // find path
        Movement.easyStar.setGrid(grid);
        Movement.easyStar.setAcceptableTiles([1]);
        Movement.easyStar.findPath(startPosition.x, startPosition.y, endPosition.x, endPosition.y, (path) => {
            if (path === null) {
                console.log("Path was not found.");
                return;
            }
            if (Movement.path === null) {
                return;
            }
            if (Movement.path.action === 'use' && (path.length === 2 || isPositionInRange($hero.position, Movement.path.destination))) {
                $hero.sprite.loop('idle-south');
                WebsocketRequest.use(Movement.path.actionData.itemId, Movement.path.destination);
                Movement.clearPath();
                return;
            }
            if (Movement.path.action === 'move' && (path.length === 2 || isPositionInRange($hero.position, Movement.path.destination))) {
                $hero.sprite.loop('idle-south');
                if (Movement.path.actionData.itemId === Board.getTileTopItem(Movement.path.actionData.fromPosition)?.id) {
                    Pointer.grabItemFromFloor(Movement.path.actionData.fromPosition);
                    Pointer.releaseItemOnFloor(Movement.path.actionData.toPosition);
                }
                Movement.clearPath();
                return;
            }
            if (Movement.path.action === 'loot' && (path.length === 2 || isPositionInRange($hero.position, Movement.path.destination))) {
                $hero.sprite.loop('idle-south');
                if (Movement.path.actionData.itemId === Board.getTileTopItem(Movement.path.actionData.fromPosition)?.id) {
                    Pointer.grabItemFromFloor(Movement.path.actionData.fromPosition);
                    Pointer.releaseItemOnInventory(Movement.path.actionData.slot ?? null);
                }
                Movement.clearPath();
                return;
            }
            if (!Movement.walk(Movement.getDirection(startPosition, path[1]))) {
                Movement.clearPath();
            }
        });
        Movement.easyStar.calculate();
    }
}
