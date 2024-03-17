<style>
@import "App.scss";
</style>

<template>
  <Inventory v-if="initialized"/>
  <Equipment v-if="initialized"/>
  <Vitality v-if="initialized"/>
  <DeadDisplay v-if="initialized"/>
  <Loot v-if="initialized"/>
</template>

<script>
import {$hero, globals} from "./utils/globals.ts";
import {emit} from "./utils/common.ts";
import Sprite from "./libs/Sprite.js";
import ItemStructure from "./libs/ItemStructure.ts";
import Effect from "./libs/Effect.ts";
import Keyboard from "./libs/Keyboard.js";
import Pointer from "./libs/Pointer.js";
import Movement from "./libs/Movement.js";
import Renderer from "./libs/Renderer.js";
import Creature from "./libs/Creature.js";
import Board from "./libs/Board.js";
import Connector from "./libs/Connector.js";
import Equipment from "./components/Equipment.vue";
import Inventory from "./components/Inventory.vue";
import Vitality from "./components/Vitality.vue";
import DeadDisplay from "./components/DeadDisplay.vue";
import Loot from "./components/Loot.vue";
import SoundEffect from "./libs/SoundEffect.js";
import {EFFECTS_PATH, ITEMS_PATH, SPRITES_PATH} from "./config.js";

export default {
  components: {DeadDisplay, Inventory, Equipment, Vitality, Loot},
  data() {
    return {
      initialized: false
    }
  },
  methods: {

    async load() {
      await SoundEffect.load();
      await Sprite.load(SPRITES_PATH);
      await ItemStructure.load(ITEMS_PATH);
      await Effect.load(EFFECTS_PATH);
    },

  },
  async mounted() {
    await this.load();

    window.addEventListener("init", (event) => {
      globals().setHero(new Creature(event.detail.name, {
        x: event.detail.x,
        y: event.detail.y
      }));
      Keyboard.init();
      Pointer.init();
      Movement.init();
      Board.init();
      Renderer.init();
      Effect.get('energy').run($hero.position, true);
      SoundEffect.play('login');

      this.initialized = true;

      setTimeout(() => {
        emit("update-vitals", {health: 100, mana: 50, maxHealth: 100, maxMana: 100});
      });
    });

    await Connector.connect('token');
  }
}
</script>
