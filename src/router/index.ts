import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/project/default/doc/char-mc',
    },
    {
      path: '/project/:pid/doc/:docId',
      component: App,
    },
  ],
})

export default router
