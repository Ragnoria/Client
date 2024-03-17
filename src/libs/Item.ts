import ItemStructure from "./ItemStructure.ts";
import Sprite from "./Sprite.js";

export default class Item {

    id: number;
    quantity: number;

    constructor(id: number, quantity: number = 1) {
        this.id = id;
        this.quantity = quantity;
    }

    getName(): string {
        return ItemStructure.get(this.id).name;
    }

    getType(): string {
        return ItemStructure.get(this.id).type;
    }

    getAltitude(): number {
        return ItemStructure.get(this.id).altitude;
    }

    getSprite(): Sprite {
        return ItemStructure.get(this.id).sprite;
    }

    isUsable(): boolean {
        return ItemStructure.get(this.id).isUsable;
    }

    isMovable(): boolean {
        return ItemStructure.get(this.id).isMovable;
    }

    isPickupable(): boolean {
        return ItemStructure.get(this.id).isPickupable;
    }

    isBlockingCreatures(): boolean {
        return ItemStructure.get(this.id).isBlockingCreatures;
    }

    isBlockingItems() {
        return ItemStructure.get(this.id).isBlockingItems;
    }

    isEquipable() {
        return ItemStructure.get(this.id).isEquipable;
    }

}
