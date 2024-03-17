<style>
@import "DeadDisplay.scss";
</style>

<template>
  <div v-if="visible" id="dead-display">
    <div class="container">
      <h2 class="title">You are dead</h2>
      <div class="subtitle">Your deeds of valor will be remembered.</div>
      <div class="buttons">
        <button @mouseenter="SoundEffect.play('click')" @click="respawn()" :disabled="disabled">Respawn</button>
      </div>
    </div>
  </div>
</template>

<script>
import Movement from "../libs/Movement.js";
import Board from "../libs/Board.js";
import {$hero, globals} from "../utils/globals.ts";
import SoundEffect from "../libs/SoundEffect.js";
import Effect from "../libs/Effect.ts";
import Creature from "../libs/Creature.js";
import {emit} from "../utils/common.ts";

export default {
  name: 'DeadDisplay',
  computed: {
    SoundEffect() {
      return SoundEffect
    }
  },
  data() {
    return {
      visible: false,
      disabled: false
    }
  },
  methods: {
    respawn() {
      SoundEffect.play('confirm');
      this.disabled = true;
      setTimeout(() => {
        const hero = new Creature('Guest', {x: 100, y: 100});
        globals().setHero(hero);
        Effect.get('energy').run($hero.position, true);
        SoundEffect.play('login');
        emit('hero-position-changed');
        emit('update-vitals', {health: 1});
        Movement.isBlocked = false;
        this.visible = false;
        this.disabled = false;
      }, 500);
    }
  },
  mounted() {
    window.addEventListener("dead", () => {
      this.visible = true;
      Movement.clearPath();
      Movement.isBlocked = true;
      delete Board.creatures[$hero.name];
      SoundEffect.play('dead');
    });
  }
}
</script>
