import {isPositionInRange, isSamePosition} from "../utils/position.ts";
import Board from "./Board.js";
import {$hero} from "../utils/globals.ts";
import Connector from "./Connector.js";

export default class WebsocketRequest {

    static moveItem(params) {
        params.fromPosition = params.fromPosition ?? null;
        params.fromSlot = params.fromSlot ?? null;
        params.toPosition = params.toPosition ?? null;
        params.toSlot = params.toSlot ?? null;

        if (!['move', 'loot', 'drop', 'swap'].includes(params.action)) return

        if (params.action === 'move') {
            if (params.fromPosition === null || params.toPosition === null) return;
            if (isSamePosition(params.fromPosition, params.toPosition)) return;
            if (!isPositionInRange($hero.position, params.fromPosition)) return;
            if (Board.getTileTopItem(params.fromPosition).id !== params.itemId) return;
            if (Board.getTileStack(params.toPosition).find((item) => item.isBlockingItems())) return;
        }

        if (params.action === 'loot') {
            if (params.fromPosition === null) return;
            if (Board.getTileTopItem(params.fromPosition).id !== params.itemId) return;
            if (!isPositionInRange($hero.position, params.fromPosition)) return;
        }

        if (params.action === 'drop') {
            if (params.fromSlot === null) return;
            if (Board.getTileStack(params.toPosition).find((item) => item.isBlockingItems())) return;
        }

        if (params.action === 'swap') {
            if (params.fromSlot === null || params.toSlot === null) return;
            if (params.fromSlot === params.toSlot) return;
        }

        Connector.transmit('move-item', params);
    }

    static useObject(itemId, position = null, slot = null) {
        if (position !== null) {
            if (Board.getTileTopItem(position)?.id !== itemId) return;
            if (!isPositionInRange($hero.position, position)) return;
        }

        Connector.transmit('use-object', {
            itemId: itemId,
            position: position,
            slot: slot,
        })
    }

    static requestTiles(positions) {
        Connector.transmit('request-tiles', {
            positions: positions,
        })
    }

    static equip(itemId, fromSlot) {
        Connector.transmit('equip', {
            itemId: itemId,
            fromSlot: fromSlot,
        })
    }

    static unequip(fromSlot) {
        Connector.transmit('unequip', {
            fromSlot: fromSlot,
        })
    }

}
