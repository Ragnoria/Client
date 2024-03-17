import { sound } from '@pixi/sound';

export default class SoundEffect {

    static load() {
        sound.add('inventoryOpen', {url: 'assets/sfx/inventory-open.mp3', preload: true});
        sound.add('inventoryClose', {url: 'assets/sfx/inventory-close.mp3', preload: true});
        sound.add('spikes', {url: 'assets/sfx/spikes.mp3', preload: true});
        sound.add('click', {url: 'assets/sfx/click.wav', preload: true});
        sound.add('confirm', {url: 'assets/sfx/confirm.mp3', preload: true});
        sound.add('chest', {url: 'assets/sfx/chest.m4a', preload: true});
        sound.add('footstep', {url: 'assets/sfx/footstep.m4a', preload: true});
        sound.add('dead', {url: 'assets/sfx/dead.m4a', preload: true});
        sound.add('mining', {url: 'assets/sfx/mining.m4a', preload: true});
        sound.add('pickup', {url: 'assets/sfx/pickup.m4a', preload: true});
        sound.add('potion', {url: 'assets/sfx/potion.m4a', preload: true});
        sound.add('login', {url: 'assets/sfx/login.m4a', preload: true});
        sound.volumeAll = 0.2;
    }

    static play(id) {
        sound.play(id);
    }
}
