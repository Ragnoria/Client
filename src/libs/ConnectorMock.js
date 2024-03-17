import Board from "./Board.js";
import {$equipment, $hero, $inventory, $vitality} from "../utils/globals.ts";
import Pointer from "./Pointer.js";
import {emit, rand, randomString, roll} from "../utils/common.ts";
import {isSamePosition} from "../utils/position.ts";
import SoundEffect from "./SoundEffect.js";
import Item from "./Item.ts";

export default class Connector {

    static async connect(token) {
        return new Promise((resolve) => {
            window.addEventListener("hero-position-changed", Connector.#onPositionChange);
            window.addEventListener("update-vitals", (event) => {
                if (event.detail?.health === 0) emit('dead');
            });

            setTimeout(() => {
                emit('init', {name: 'Guest', x: 100, y: 100});
            }, 250)

            return resolve();
        });
    }

    static emit(event, params) {
        if (event === 'use') return Connector.#use(params);
        if (event === 'request-tiles') return Connector.#requestTiles(params);
        if (event === 'move-item') return Connector.#moveItem(params);
        if (event === 'equip') return Connector.#equip(params);
        if (event === 'unequip') return Connector.#unequip(params);
    }

    static #use(params) {
        if (params.itemId === 6) {
            if (params.slot !== null) return;
            const stack = Board.getTileStack(params.position);
            stack.pop();

            SoundEffect.play('chest');
            emit('update-tiles', {tiles: [{position: params.position, stack: stack}]});
            emit('run-effect', {position: params.position, effect: 'yellow-sparkles'});

            if (roll(2)) {
                emit('loot', {itemId: 9, quantity: 1});
                let slot = $inventory.getFirstSlotWithItem(9) ?? $inventory.getFirstSlotWithItem(null);
                let quantity = $inventory.getSlot(slot).item?.quantity ?? 0;
                emit('update-inventory-slot', {slot: slot, itemId: 9, quantity: quantity + 1});
            } else if (roll(2)) {
                emit('loot', {itemId: 11, quantity: 1});
                let slot = $inventory.getFirstSlotWithItem(11) ?? $inventory.getFirstSlotWithItem(null);
                let quantity = $inventory.getSlot(slot).item?.quantity ?? 0;
                emit('update-inventory-slot', {slot: slot, itemId: 11, quantity: quantity + 1});
            } else {
                emit('loot', {itemId: 14, quantity: 1});
                let slot = $inventory.getFirstSlotWithItem(14) ?? $inventory.getFirstSlotWithItem(null);
                let quantity = $inventory.getSlot(slot).item?.quantity ?? 0;
                emit('update-inventory-slot', {slot: slot, itemId: 14, quantity: quantity + 1});
            }
        }

        if (params.itemId === 8) {
            if (params.slot !== null) return;
            SoundEffect.play('mining');
            emit('run-effect', {position: params.position, effect: 'ore-hit'});

            const quantity = rand(3);
            if (roll(3) && quantity) {
                emit('loot', {itemId: 10, quantity: quantity});
                let slot = $inventory.getFirstSlotWithItem(10) ?? $inventory.getFirstSlotWithItem(null);
                const oldQuantity = $inventory.getSlot(slot).item?.quantity ?? 0;
                emit('update-inventory-slot', {slot: slot, itemId: 10, quantity: oldQuantity + quantity});
            }
        }

        if (params.itemId === 9) {
            if (params.slot !== null) {
                const currentQuantity = $inventory.getSlot(params.slot).item?.quantity ?? 0;
                if (currentQuantity > 1) {
                    emit('update-inventory-slot', {slot: params.slot, itemId: params.itemId, quantity: currentQuantity - 1});
                } else {
                    emit('update-inventory-slot', {slot: params.slot, itemId: null});
                }
            } else {
                const item = Board.getTileTopItem(params.position);
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    const stack = Board.getTileStack(params.position);
                    stack.pop();
                }
            }
            let health = $vitality.health + 1000;
            if (health > $vitality.maxHealth) health = $vitality.maxHealth;
            emit('update-vitals', {health: health});
            emit('run-effect', {position: $hero.position, effect: 'red-sparkles'})
            SoundEffect.play('potion');
        }

        if (params.itemId === 11) {
            if (params.slot !== null) {
                const currentQuantity = $inventory.getSlot(params.slot).item?.quantity ?? 0;
                if (currentQuantity > 1) {
                    emit('update-inventory-slot', {slot: params.slot, itemId: params.itemId, quantity: currentQuantity - 1});
                } else {
                    emit('update-inventory-slot', {slot: params.slot, itemId: null});
                }
            } else {
                const item = Board.getTileTopItem(params.position);
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    const stack = Board.getTileStack(params.position);
                    stack.pop();
                }
            }
            let mana = $vitality.mana + 50;
            if (mana > $vitality.maxMana) mana = $vitality.maxMana;
            emit('update-vitals', {mana: mana});
            emit('run-effect', {position: $hero.position, effect: 'blue-sparkles'})
            SoundEffect.play('potion');
        }

        Pointer.refreshPointer();
    }

    static #requestTiles(params) {
        for (const position of params.positions) {
            const stack = [];

            if (roll(40)) {
                stack.push(new Item(2));
            } else if (roll(40)) {
                stack.push(new Item(3));
            } else if (roll(30)) {
                stack.push(new Item(4));
            } else {
                stack.push(new Item(1))
            }

            if (!isSamePosition(position, $hero.position)) {
                if (roll(100)) {
                    stack.push(new Item(6));
                } else if (roll(100)) {
                    stack.push(new Item(8));
                } else if (roll(100)) {
                    stack.push(new Item(5));
                } else if (roll(100)) {
                    stack.push(new Item(7));
                } else if (roll(100)) {
                    stack.push(new Item(12));
                }
            }

            emit('update-tiles', {tiles: [{position: position, stack: stack}]});
            if (roll(350)) {
                emit('add-creature', {position: position, name: 'NPC #' + randomString(4)});
            }
        }
    }

    static #onPositionChange() {
        const stack = Board.getTileStack($hero.position);
        stack.forEach((item, index) => {
            if (item.id === 12) {
                let health = $vitality.health - 15;
                if (health < 0) health = 0;
                stack[index] = new Item(13);
                Board.update();
                emit('run-effect', {position: $hero.position, effect: 'blood', onCreature: true});
                emit('update-vitals', {health: health});
                SoundEffect.play('spikes');
                setTimeout(() => {
                    stack[index] = new Item(12)
                }, 1000);
            }
        });
    }

    static #moveItem(params) {
        if (params.action === 'move') return Connector.#handleMove(params);
        if (params.action === 'loot') return Connector.#handleLoot(params);
        if (params.action === 'drop') return Connector.#handleDrop(params);
        if (params.action === 'swap') return Connector.#handleSwap(params);
    }

    static #handleMove(params) {
        const stackFrom = Board.getTileStack(params.fromPosition);
        stackFrom.pop();
        const stackTo = Board.getTileStack(params.toPosition);
        stackTo.push(new Item(params.itemId, params.quantity));

        emit('update-tiles', {tiles: [
            {position: params.fromPosition, stack: stackFrom},
            {position: params.toPosition, stack: stackTo}
        ]});
    }

    static #handleLoot(params) {
        const stack = Board.getTileStack(params.fromPosition);
        stack.pop();
        emit('update-tiles', {tiles: [{position: params.fromPosition, stack: stack}]});
        params.toSlot = params.toSlot ?? $inventory.getFirstSlotWithItem(params.itemId) ?? $inventory.getFirstSlotWithItem(null);
        const inventorySlotItem = $inventory.getSlot(params.toSlot).item;
        if (inventorySlotItem) {
            if (inventorySlotItem.id === params.itemId) {
                emit('update-inventory-slot', {slot: params.toSlot, itemId: params.itemId, quantity: inventorySlotItem.quantity + params.quantity});
            } else {
                stack.push(inventorySlotItem);
                emit('update-inventory-slot', {slot: params.toSlot, itemId: params.itemId, quantity: params.quantity});
            }
        } else {
            emit('update-inventory-slot', {slot: params.toSlot, itemId: params.itemId, quantity: params.quantity});
        }
        emit('loot', {itemId: params.itemId, quantity: params.quantity});
    }

    static #handleDrop(params) {
        const quantityLeft = $inventory.getSlot(params.fromSlot).item.quantity - params.quantity;
        emit('update-inventory-slot', {slot: params.fromSlot, itemId: params.itemId, quantity: quantityLeft});

        const position = params.toPosition ?? $hero.position;
        const stack = Board.getTileStack(position);
        stack.push(new Item(params.itemId, params.quantity));
        emit('update-tiles', {tiles: [{position: position, stack: stack}]});
    }

    static #handleSwap(params) {
        const itemSource = $inventory.getSlot(params.fromSlot).item?.id;
        const quantitySource = $inventory.getSlot(params.fromSlot).item?.quantity ?? 0;
        const itemTarget = $inventory.getSlot(params.toSlot).item?.id;
        const quantityTarget = $inventory.getSlot(params.toSlot).item?.quantity ?? 0;
        if (itemSource === itemTarget) {
            if (params.quantity === quantitySource) {
                emit('update-inventory-slot', {slot: params.fromSlot, itemId: null});
            } else {
                emit('update-inventory-slot', {slot: params.fromSlot, itemId: params.itemId, quantity: quantitySource - params.quantity});
            }
            emit('update-inventory-slot', {slot: params.toSlot, itemId: params.itemId, quantity: quantityTarget + params.quantity});
        } else {
            if (params.quantity === quantitySource) {
                emit('update-inventory-slot', {slot: params.fromSlot, itemId: itemTarget, quantity: quantityTarget});
                emit('update-inventory-slot', {slot: params.toSlot, itemId: itemSource, quantity: quantitySource});
            }
        }
    }

    static #equip(params) {
        const quantityLeft = $inventory.getSlot(params.fromSlot).item.quantity - 1;
        if ($equipment.getSlot('equipment-armor').item?.id) {
            return;
        }
        emit('update-inventory-slot', {slot: params.fromSlot, itemId: params.itemId, quantity: quantityLeft});
        emit('update-equipment-slot', {
            slot: 'equipment-armor',
            itemId: params.itemId,
            quantity: 1
        });
    }

    static #unequip(params) {
        if (!$equipment.getSlot(params.fromSlot).item?.id) {
            return;
        }
        const item = $equipment.getSlot(params.fromSlot).item;
        emit('update-equipment-slot', {
            slot: params.fromSlot,
            itemId: null
        });
        emit('update-inventory-slot', {
            slot: $inventory.getFirstSlotWithItem(null),
            itemId: item.id,
            quantity: 1
        });
    }

}
