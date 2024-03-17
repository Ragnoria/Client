import Creature from "../libs/Creature.js";

export var $app: any;
export var $hero: Creature;
export var $vitality: any;
export var $inventory: any;
export var $equipment: any;

export const globals = () => {
    return {
        setApp: (value: any) => $app = value,
        setHero: (value: Creature) => $hero = value,
        setVitality: (value: any) => $vitality = value,
        setInventory: (value: any) => $inventory = value,
        setEquipment: (value: any) => $equipment = value,
    }
}
