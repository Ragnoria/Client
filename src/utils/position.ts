import {Position} from "../interfaces/Position.ts";

export const isPositionInRange = function (position1: Position, position2: Position, radius: number = 1) : boolean{
    const fromX: number = position1.x - radius;
    const fromY: number = position1.y - radius;
    const toX: number = position1.x + radius;
    const toY: number = position1.y + radius;

    return (position2.x >= fromX && position2.x <= toX) && (position2.y >= fromY && position2.y <= toY);
}

export const isSamePosition = function (position1: Position, position2: Position): boolean {
    return position1.x === position2.x && position1.y === position2.y;
}
