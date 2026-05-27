import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import '@bryntum/grid/grid.css'
import App from './App.vue'

createApp(App).use(VueQueryPlugin).mount('#app')
