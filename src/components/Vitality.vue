<style>
@import "Vitality.scss";
</style>

<template>
  <div id="vitality">
    <div class="icon"></div>
    <div class="health-bar">
      <div class="indicator" :style="{width: healthPercent + '%'}"></div>
      <div class="label">{{ health }} / {{ maxHealth }}</div>
    </div>
    <div class="mana-bar">
      <div class="indicator" :style="{width: manaPercent + '%'}"></div>
      <div class="label">{{ mana }} / {{ maxMana }}</div>
    </div>
    <div>
      <span v-for="state in states">{{ state }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import {$hero, globals} from "../utils/globals.ts";
import Renderer from "../libs/Renderer.js";

export default {
  name: 'Vitality',
  data() {
    return {
      health: 0,
      mana: 0,
      maxHealth: 0,
      maxMana: 0,
      healthPercent: 0,
      manaPercent: 0,
      states: []
    }
  },
  mounted() {
    globals().setVitality(this);
    window.addEventListener("update-vitals", (event: any) => {
      if (typeof event.detail.health !== 'undefined') {
        const changed = event.detail.health - this.health;
        if (changed) {
          Renderer.addFloatingText(Math.abs(changed), changed > 0 ? '#00ff00' : '#ff0000');
          this.health = event.detail.health;
        }
      }
      if (typeof event.detail.mana !== 'undefined') this.mana = event.detail.mana;
      if (typeof event.detail.maxHealth !== 'undefined') this.maxHealth = event.detail.maxHealth;
      if (typeof event.detail.maxMana !== 'undefined') this.maxMana = event.detail.maxMana;
      if (typeof event.detail.states !== 'undefined') this.states = event.detail.states;
      this.healthPercent = Math.ceil((this.health / this.maxHealth) * 100);
      this.manaPercent = Math.ceil((this.mana / this.maxMana) * 100);
      $hero.healthPercent = this.healthPercent;
    });
  }
}
</script>
