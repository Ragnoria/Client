<style>
@import "Slot.scss";
</style>

<template>
  <div class="slot" :data-slot-id="id" @click="onClick()">
    <div v-if="item && item.quantity > 1" class="quantity">{{ item.quantity }}</div>
  </div>
</template>

<script>
import WebsocketRequest from "../libs/WebsocketRequest.js";

export default {
  name: 'Slot',
  props: {
    id: String,
  },
  data() {
    return {
      item: null,
      sprite: null,
    }
  },
  methods: {
    onClick() {
      if (!this.item) return;
      if (this.item.isUsable()) {
        WebsocketRequest.use(this.item.id, null, this.id);
        return;
      }
      if (this.item.isEquipable()) {
        if (this.id.includes('equipment-')) {
          WebsocketRequest.unequip(this.id);
        } else {
          WebsocketRequest.equip(this.item.id, this.id);
        }
        return;
      }
    },
    set(item) {
      this.item = item;
      this.$el.querySelector('canvas')?.remove();
      const sprite = this.item.getSprite().clone();
      sprite.getFrame();
      this.$el.appendChild(sprite.canvas);
    },
    clear() {
      this.item = null;
      this.$el.querySelector('canvas')?.remove();
    },
  }
}
</script>
