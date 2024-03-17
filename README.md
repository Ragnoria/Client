# Vue 3 + Vite + TypeScript

Testowane na node v16.13.0 (npm v8.1.0)

## TODO

**Features**
- MoveItem - split stacków
- isStackable()
- obsługa animate-in w sprite?
- zadania z progressbarem (np. mining trwa 2 sekundy)

**Optimisation**
- clearing temp. canvas VS recreate temp. canvas object
- strokeText() + fillText() VS text-to-image & draw from cache
- avoid rendering tiles out of viewport

**Enhance**
- Jeśli `Tile` jest tym samym co `Stack` to ujednolicić.
- draw cursor effects on hud
- equip/unequip sound effect
- obsługa braku wolnego slota (przy pickup/unequip)

## Contracts

#### MoveItem
Podnoszenie, upuszczanie, przekładanie w ekwipunku oraz przemieszczanie po mapie.

```json
{
  "event": "move-item",
  "params": {
    "action": string, // "move" | "pickup" | "drop" | "swap"
    "itemId": int,
    "quantity": int,
    "fromPosition": ?IPosition,
    "fromSlot": ?int,
    "toPosition": ?IPosition,
    "toSlot": ?int
  }
}
```
