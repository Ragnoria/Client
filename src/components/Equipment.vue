<style>
@import "Equipment.scss";
</style>

<template>
  <button class="bookmark-equipment" @click="this.toggle()" :class="{'active': visible}">
    <img src="../assets/images/equipment.png" alt="Eq"/>
  </button>
  <div id="equipment" :style="{'display': visible ? 'block' : 'none'}">
    <div class="header">
      <div class="header-icon"></div>
      <span class="header-title">Equipment</span>
      <button @click="toggle()" class="button-close">✕</button>
    </div>
    <div class="container">
      <div class="slots">
        <Slot ref="equipment-helmet" id="equipment-helmet"></Slot>
        <Slot ref="equipment-armor" id="equipment-armor"></Slot>
        <Slot ref="equipment-belt" id="equipment-belt"></Slot>
        <Slot ref="equipment-boots" id="equipment-boots"></Slot>
        <Slot ref="equipment-amulet" id="equipment-amulet"></Slot>
        <Slot ref="equipment-cape" id="equipment-cape"></Slot>
        <Slot ref="equipment-weapon" id="equipment-weapon"></Slot>
        <Slot ref="equipment-shield" id="equipment-shield"></Slot>
        <Slot ref="equipment-glove" id="equipment-glove"></Slot>
        <Slot ref="equipment-ring" id="equipment-ring"></Slot>
      </div>
    </div>
  </div>
</template>

<script>
import Slot from "./Slot.vue";
import {globals} from "../utils/globals.ts";
import SoundEffect from "../libs/SoundEffect.js";
import Item from "../libs/Item.ts";

export default {
  name: 'Equipment',
  components: {Slot},
  data() {
    return {
      visible: false
    }
  },
  methods: {
    getSlot(slot) {
      return this.$refs[slot];
    },
    getSlots() {
      return this.$refs;
    },
    toggle() {
      this.visible = !this.visible;
      if (this.visible) {
        SoundEffect.play('inventoryOpen');
      } else {
        SoundEffect.play('inventoryClose');
      }
    },
  },
  mounted() {
    globals().setEquipment(this);
    window.addEventListener("update-equipment-slot", (event) => {
      if (event.detail.itemId && event.detail.quantity > 0) {
        this.getSlot(event.detail.slot).set(new Item(event.detail.itemId, event.detail.quantity));
      } else {
        this.getSlot(event.detail.slot).clear();
      }
    });
    window.addEventListener("equipment-toggle", this.toggle);
  }
}
</script>
