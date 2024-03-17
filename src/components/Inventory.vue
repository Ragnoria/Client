<style>
@import "Inventory.scss";
</style>

<template>
  <button class="bookmark-inventory" @click="this.toggle()" :class="{'active': visible}">
    <img src="../assets/images/inventory.png" alt="Inv"/>
  </button>
  <div id="inventory" :style="{'display': visible ? 'block' : 'none'}">
    <div class="header">
      <div class="header-icon"></div>
      <span class="header-title">Inventory</span>
      <button @click="toggle()" class="button-close">✕</button>
    </div>
    <div class="container">
      <Slot ref="inventory-1" id="inventory-1"></Slot>
      <Slot ref="inventory-2" id="inventory-2"></Slot>
      <Slot ref="inventory-3" id="inventory-3"></Slot>
      <Slot ref="inventory-4" id="inventory-4"></Slot>
      <Slot ref="inventory-5" id="inventory-5"></Slot>
      <Slot ref="inventory-6" id="inventory-6"></Slot>
      <Slot ref="inventory-7" id="inventory-7"></Slot>
      <Slot ref="inventory-8" id="inventory-8"></Slot>
      <Slot ref="inventory-9" id="inventory-9"></Slot>
      <Slot ref="inventory-10" id="inventory-10"></Slot>
      <Slot ref="inventory-11" id="inventory-11"></Slot>
      <Slot ref="inventory-12" id="inventory-12"></Slot>
      <Slot ref="inventory-13" id="inventory-13"></Slot>
      <Slot ref="inventory-14" id="inventory-14"></Slot>
      <Slot ref="inventory-15" id="inventory-15"></Slot>
      <Slot ref="inventory-16" id="inventory-16"></Slot>
      <Slot ref="inventory-17" id="inventory-17"></Slot>
      <Slot ref="inventory-18" id="inventory-18"></Slot>
      <Slot ref="inventory-19" id="inventory-19"></Slot>
      <Slot ref="inventory-20" id="inventory-20"></Slot>
      <Slot ref="inventory-21" id="inventory-21"></Slot>
      <Slot ref="inventory-22" id="inventory-22"></Slot>
      <Slot ref="inventory-23" id="inventory-23"></Slot>
      <Slot ref="inventory-24" id="inventory-24"></Slot>
    </div>
  </div>
</template>

<script>
import Slot from "./Slot.vue";
import {globals} from "../utils/globals.ts";
import SoundEffect from "../libs/SoundEffect.js";
import Item from "../libs/Item.ts";

export default {
  name: 'Inventory',
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
    getFirstSlotWithItem(itemId) {
      for (const [slotId, value] of Object.entries(this.getSlots())) {
        if (value.item ? value.item.id === itemId : null === itemId) {
          return slotId;
        }
      }
      return null;
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
    globals().setInventory(this);
    window.addEventListener("update-inventory-slot", (event) => {
      if (event.detail.itemId && event.detail.quantity > 0) {
        this.getSlot(event.detail.slot).set(new Item(event.detail.itemId, event.detail.quantity));
      } else {
        this.getSlot(event.detail.slot).clear();
      }
    });
    window.addEventListener("inventory-toggle", this.toggle);
  }
}
</script>
