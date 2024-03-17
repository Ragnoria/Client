import Sprite from "./Sprite.js";
import {ItemStructureConfig} from "../interfaces/ItemStructureConfig.ts";

export default class ItemStructure {

    static #instances: { [p: number]: ItemStructure } = {};

    id: number;
    name: string;
    type: string;
    altitude: number;
    sprite: Sprite;
    isUsable: boolean;
    isMovable: boolean;
    isPickupable: boolean;
    isBlockingCreatures: boolean;
    isBlockingItems: boolean;
    isEquipable: boolean;

    static async load(src: string) {
        try {
            const response = await fetch(src);
            const json: ItemStructureConfig[] = await response.json();
            return new Promise<void>((resolve) => {
                Object.values(json).forEach((config) => new ItemStructure(config));
                resolve();
            });
        } catch (error) {
            console.error("Error loading items:", error);
        }
    }

    static get(id: number): ItemStructure {
        const structure: ItemStructure = ItemStructure.#instances[id];
        if (!structure) throw `Could not load structure for item ${id}.`;

        return structure;
    }

    constructor(config: ItemStructureConfig) {
        ItemStructure.#instances[config.id] = this;

        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.altitude = config.altitude;
        this.isUsable = config.isUsable;
        this.isMovable = config.isMovable;
        this.isPickupable = config.isPickupable;
        this.isBlockingCreatures = config.isBlockingCreatures;
        this.isBlockingItems = config.isBlockingItems;
        this.isEquipable = config.isEquipable;

        this.sprite = Sprite.get(config.sprite);
        this.sprite.loop();
    }
}
