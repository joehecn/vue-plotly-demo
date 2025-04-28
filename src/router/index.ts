import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    {
      path: '/chiller',
      name: 'chiller',
      component: () => import('../views/ChillerView.vue'),
    },
    {
      path: '/cdwp',
      name: 'cdwp',
      component: () => import('../views/CdwpView.vue'),
    },
    {
      path: '/cooling-tower',
      name: 'cooling-tower',
      component: () => import('../views/CtView.vue'),
    },
    {
      path: '/chiller-power',
      name: 'chiller-power',
      component: () => import('../views/ChillerPower.vue'),
    },
    {
      path: '/cdwp-power',
      name: 'cdwp-power',
      component: () => import('../views/CdwpPower.vue'),
    },
    {
      path: '/ct-power',
      name: 'ct-power',
      component: () => import('../views/CtPower.vue'),
    },
    {
      path: '/cooling-load',
      name: 'cooling-load',
      component: () => import('../views/CoolingLoad.vue'),
    }
  ],
})

export default router
