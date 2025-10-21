import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Movies from '../views/Movies.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/movies',
    name: 'Movies',
    component: Movies
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router