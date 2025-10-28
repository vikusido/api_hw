import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Movies from '../views/Movies.vue'
import Weather from '../views/Weather.vue'

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
  },
  {
  path: '/weather',
  name: 'Weather',
  component: Weather
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router