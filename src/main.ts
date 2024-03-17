import { createApp } from 'vue'
import App from './App.vue'
import {globals} from "./utils/globals.ts";

globals().setApp(document.querySelector('#app'));
createApp(App).mount('#app')
