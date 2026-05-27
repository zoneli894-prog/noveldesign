import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueKonva from 'vue-konva'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(VueKonva)
app.mount('#app')
