import {BOARD_HEIGHT, BOARD_WIDTH} from "../config.js";
import {$hero} from "../utils/globals.ts";
import WebsocketRequest from "./WebsocketRequest.js";
import Creature from "./Creature.js";
import Pointer from "./Pointer.js";

export default class Board {

    static width = null;
    static height = null;
    static firstTilePosition = {};
    static lastTilePosition = {};
    static tiles = {};
    static creatures = {};

    static init() {
        Board.width = BOARD_WIDTH;
        Board.height = BOARD_HEIGHT;

        window.addEventListener("update-tiles", (event) => {
            event.detail.tiles.forEach((tile) => {
                Board.updateTile(tile.position, tile.stack);
            })
            Pointer.refreshPointer();
        });
        window.addEventListener("add-creature", (event) => {
            new Creature(event.detail.name, event.detail.position)
        });
        window.addEventListener("hero-position-changed", Board.update);

        Board.update();
    }

    static update() {
        Board.firstTilePosition = {
            x: $hero.position.x - Math.floor(Board.width / 2),
            y: $hero.position.y - Math.floor(Board.height / 2),
        };
        Board.lastTilePosition = {
            x: $hero.position.x + Math.floor(Board.width / 2),
            y: $hero.position.y + Math.floor(Board.height / 2),
        };

        for (const [name, creature] of Object.entries(Board.creatures)) {
            if (!Board.isOnArea(creature.position)) {
                delete Board.creatures[name];
            }
        }

        const missingTilesPositions = [];
        const _tiles = {};
        for (let y = Board.firstTilePosition.y; y <= Board.lastTilePosition.y; y++) {
            for (let x = Board.firstTilePosition.x; x <= Board.lastTilePosition.x; x++) {
                _tiles[y] = _tiles[y] || {};
                if ((Board.tiles[y]) && (Board.tiles[y][x])) {
                    _tiles[y][x] = Board.tiles[y][x];
                } else {
                    _tiles[y][x] = [];
                    missingTilesPositions.push({x: x, y: y});
                }
            }
        }
        Board.tiles = _tiles;
        WebsocketRequest.requestTiles(missingTilesPositions);
    }

    static getTileStack(position) {
        if (typeof Board.tiles[position.y] == 'undefined' || typeof Board.tiles[position.y][position.x] == 'undefined') {
            return []
        }

        return Board.tiles[position.y][position.x];
    }

    static getTileTopItem(position) {
        const stack = Board.getTileStack(position);

        return stack[stack.length - 1] ?? null;
    }

    static updateTile(position, stack) {
        if ((typeof Board.tiles[position.y] != 'undefined') && (typeof Board.tiles[position.y][position.x] != 'undefined')) {
            Board.tiles[position.y][position.x] = stack;
        }
    }

    static isWalkable(position) {
        const stack = Board.getTileStack(position);

        if (!stack.find((item) => item.getType() === 'ground')) {
            return false
        }
        if (stack.find((item) => item.isBlockingCreatures())) {
            return false
        }

        return true;
    }

    static isOnArea(position) {
        return (position.x >= Board.firstTilePosition.x && position.x <= Board.lastTilePosition.x) && (position.y >= Board.firstTilePosition.y && position.y <= Board.lastTilePosition.y);
    }

    static positionClientToServer(position) {
        return {
            x: position.x + Board.firstTilePosition.x,
            y: position.y + Board.firstTilePosition.y,
        }
    }

    static positionServerToClient(position) {
        return {
            x: position.x - Board.firstTilePosition.x,
            y: position.y - Board.firstTilePosition.y,
        }
    }
}
