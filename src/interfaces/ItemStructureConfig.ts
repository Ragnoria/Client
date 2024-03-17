export interface ItemStructureConfig
{
    id: number;
    name: string;
    type: string;
    sprite: string;
    altitude: number;
    isUsable: boolean;
    isMovable: boolean;
    isPickupable: boolean;
    isBlockingCreatures: boolean;
    isBlockingItems: boolean;
    isEquipable: boolean;
}
