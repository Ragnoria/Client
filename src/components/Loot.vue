<style>
@import "Loot.scss";
</style>

<template>
  <div id="loot"></div>
</template>

<script>
import SoundEffect from "../libs/SoundEffect.js";
import Item from "../libs/Item.ts";

export default {
  name: 'Loot',
  methods: {
    addItem(item) {
      const $element = document.createElement('div');
      $element.classList.add('entry')

      const $content = document.createElement('div');
      $content.classList.add('content')
      $content.innerText = item.getName() + ' (' + item.quantity + ')';

      const $image = item.getSprite().clone().getFrame();
      $image.classList.add('image');

      $element.appendChild($image);
      $element.appendChild($content);
      document.querySelector('#loot').appendChild($element);
      setTimeout(() => {
        $element.classList.add('hiding');
      }, 2500);
      setTimeout(() => {
        $element.remove();
      }, 3000);
      SoundEffect.play('pickup');
    }
  },
  mounted() {
    window.addEventListener("loot", (event) => {
        this.addItem(new Item(event.detail.itemId, event.detail.quantity));
    });
  }
}
</script>
