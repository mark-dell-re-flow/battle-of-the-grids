import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.scss'
import '@bryntum/grid/grid.css'
import App from './App.vue'

createApp(App).use(VueQueryPlugin).mount('#app')
