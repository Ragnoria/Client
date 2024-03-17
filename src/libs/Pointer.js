import {TILE_SIZE} from "../config.js";
import {isPositionInRange, isSamePosition} from "../utils/position.ts";
import Board from "./Board.js";
import Movement from "./Movement.js";
import Sprite from "./Sprite.js";
import {$app, $hero, $inventory} from "../utils/globals.ts";
import WebsocketRequest from "./WebsocketRequest.js";
import Renderer from "./Renderer.js";

export default class Pointer {

    static positionWindow = {x: null, y: null}
    static positionCanvas = {x: null, y: null}
    static positionClient = {x: null, y: null}
    static positionServer = {x: null, y: null}
    static isLeftButtonPressed = false;
    static isRightButtonPressed = false;
    static grabbing = {
        item: null,
        source: null,
    }
    static effect = null;

    static init() {
        document.addEventListener('mousemove', (e) => {
            Pointer.recalcMousePosition(e);
            if (Pointer.isLeftButtonPressed && !Pointer.grabbing.item) {
                if (e.target.id === "board") {
                    Pointer.grabItemFromFloor({...Pointer.positionServer});
                } else if (e.target.classList && e.target.classList.contains('slot') && e.target.closest('#inventory')) {
                    Pointer.grabItemFromInventory(e.target.dataset.slotId);
                }
            }
        }, false);

        document.addEventListener('mousedown', (e) => {
            Pointer.recalcMousePosition(e);
            if (e.which === 1 || e.button === 0) {
                Pointer.isLeftButtonPressed = true;
                Pointer.onLeftButtonPress(e);
            }
        }, false);

        document.addEventListener('mouseup', (e) => {
            Pointer.recalcMousePosition(e);
            if (e.which === 1 || e.button === 0) {
                Pointer.isLeftButtonPressed = false;
                Pointer.onLeftButtonRelease(e);
            }
        }, false);

        document.addEventListener('contextmenu', e => e?.cancelable && e.preventDefault());
    }

    static recalcMousePosition(e) {
        const rect = Renderer.ctx.canvas.getBoundingClientRect();
        const oldPositionClient = {...Pointer.positionClient};

        Pointer.positionWindow = {
            x: e.clientX,
            y: e.clientY
        };

        Pointer.positionCanvas = {
            x: ((e.clientX - rect.left) / (rect.right - rect.left) * Renderer.ctx.canvas.width),
            y: ((e.clientY - rect.top) / (rect.bottom - rect.top) * Renderer.ctx.canvas.height),
        };

        Pointer.positionClient = {
            x: Math.floor((Pointer.positionCanvas.x + $hero.offset.x) / TILE_SIZE),
            y: Math.floor((Pointer.positionCanvas.y + $hero.offset.y) / TILE_SIZE),
        };

        if (!isSamePosition(Pointer.positionClient, oldPositionClient)) {
            Pointer.refreshPointer();
        } else {
            Pointer.positionServer = Board.positionClientToServer(Pointer.positionClient);
        }
    }

    static refreshPointer() {
        Pointer.positionServer = Board.positionClientToServer(Pointer.positionClient);
        if (Pointer.grabbing.item) return;

        const item = Board.getTileTopItem(Pointer.positionServer);
        if (!item) {
            Pointer.setCursor('default');
            return;
        }
        if (item.isPickupable()) {
            Pointer.setCursor('hand');
            return;
        }
        if (!item.isUsable()) {
            Pointer.setCursor('default');
            return;
        }
        if (item.getType() === 'ore') {
            Pointer.setCursor('pick');
            return;
        }
        if (item.getType() === 'chest') {
            Pointer.setCursor('chest');
            return;
        }
        Pointer.setCursor('gears');
    }

    static onLeftButtonPress(e) {

    }

    static onLeftButtonRelease(e) {
        // release grab
        if (Pointer.grabbing.item) {
            if (e.target.id === "board") {
                return Pointer.releaseItemOnFloor({...Pointer.positionServer});
            }
            if (e.target.classList && e.target.classList.contains('slot') && e.target.closest('#inventory')) {
                return Pointer.releaseItemOnInventory(e.target.dataset.slotId);
            }

            Pointer.cleanGrab();
            Pointer.refreshPointer();
            return;
        }

        if (e.target.id !== "board") return;

        const position = {...Pointer.positionServer};
        const item = Board.getTileTopItem(position);
        if (!item) return;

        if (item.isPickupable()) {
            Pointer.runEffect('pointer-cross-red');
            if (isPositionInRange($hero.position, position)) {
                WebsocketRequest.moveItem({
                    action: 'loot',
                    itemId: item.id,
                    quantity: item.quantity,
                    fromPosition: position
                });
            } else {
                Movement.setPath(Pointer.positionServer, 'loot', {
                    itemId: item.id,
                    fromPosition: position,
                });
            }
            return;
        }

        if (item.isUsable()) {
            Pointer.runEffect('pointer-cross-red');
            if (isPositionInRange($hero.position, position)) {
                WebsocketRequest.use(item.id, position);
            } else {
                Movement.setPath(Pointer.positionServer, 'use', {
                    itemId: item.id
                });
            }
            return;
        }

        Pointer.runEffect('pointer-cross-yellow');
        Movement.setPath(Pointer.positionServer, 'walk');
    }

    static grabItemFromFloor(fromPosition) {
        const item = Board.getTileTopItem(fromPosition);
        if (!item) return;
        if (!item.isMovable()) return;
        Pointer.grabbing.item = item;
        Pointer.grabbing.fromPosition = fromPosition;
        Pointer.setCursor('crosshair');
    }

    static grabItemFromInventory(fromSlot) {
        const item = $inventory.getSlot(fromSlot).item;
        if (!item) return;
        Pointer.grabbing.item = item;
        Pointer.grabbing.fromSlot = fromSlot;
        Pointer.setCursor('crosshair');
    }

    static releaseItemOnFloor(toPosition) {
        const item = Pointer.grabbing.item;
        if (Pointer.grabbing.fromPosition) {
            const fromPosition = {...Pointer.grabbing.fromPosition};
            Pointer.cleanGrab();
            Pointer.refreshPointer();

            if (isSamePosition(fromPosition, toPosition)) {
                return;
            }
            if (isPositionInRange($hero.position, fromPosition)) {
                WebsocketRequest.moveItem({
                    action: 'move',
                    itemId: item.id,
                    quantity: item.quantity,
                    fromPosition: fromPosition,
                    toPosition: toPosition
                });
            } else {
                Movement.setPath(fromPosition, 'move', {
                    itemId: item.id,
                    fromPosition: fromPosition,
                    toPosition: toPosition,
                })
            }
        } else {
            const fromSlot = Pointer.grabbing.fromSlot;
            Pointer.cleanGrab();
            Pointer.refreshPointer();
            WebsocketRequest.moveItem({
                action: 'drop',
                itemId: item.id,
                quantity: item.quantity,
                fromSlot: fromSlot,
                toPosition: toPosition
            });
        }
    }

    static releaseItemOnInventory(toSlot) {
        const item = Pointer.grabbing.item;
        if (Pointer.grabbing.fromPosition) {
            const fromPosition = {...Pointer.grabbing.fromPosition};
            Pointer.cleanGrab();
            Pointer.refreshPointer();
            if (!item.isPickupable()) {
                return;
            }
            if (isPositionInRange($hero.position, fromPosition)) {
                WebsocketRequest.moveItem({
                    action: 'loot',
                    itemId: item.id,
                    quantity: item.quantity,
                    fromPosition: fromPosition,
                    toSlot: toSlot
                });
            } else {
                Movement.setPath(fromPosition, 'loot', {
                    itemId: item.id,
                    fromPosition: fromPosition,
                    slot: toSlot,
                })
            }
        } else {
            const fromSlot = Pointer.grabbing.fromSlot;
            Pointer.cleanGrab();
            Pointer.refreshPointer();
            WebsocketRequest.moveItem({
                action: 'swap',
                itemId: item.id,
                quantity: item.quantity,
                fromSlot: fromSlot,
                toSlot: toSlot
            });
        }
    }

    static cleanGrab() {
        Pointer.grabbing.item = null;
        Pointer.grabbing.fromSlot = null;
        Pointer.grabbing.fromPosition = null;
    }

    static runEffect(name) {
        const effectSprite = Sprite.get(name).clone();
        const effect = {
            sprite: effectSprite,
            position: {...Pointer.positionCanvas},
        }
        effectSprite.play().then(() => {
            if (Pointer.effect === effect) {
                Pointer.effect = null
            }
        });
        Pointer.effect = effect;
    }

    static setCursor(name) {
        if (name === 'default') {
            $app.removeAttribute('cursor');
        } else {
            $app.setAttribute('cursor', name);
        }
    }
}
