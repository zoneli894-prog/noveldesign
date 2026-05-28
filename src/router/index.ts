import { createRouter, createWebHashHistory } from 'vue-router'
import App from '@/App.vue'
import ProjectHome from '@/components/project/ProjectHome.vue'
import MapEditorPage from '@/components/map/MapEditorPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/project/default',
    },
    {
      path: '/project/:pid',
      component: ProjectHome,
    },
    {
      path: '/project/:pid/doc/:docId',
      component: App,
    },
    {
      path: '/project/:pid/map',
      component: MapEditorPage,
    },
  ],
})

export default router
