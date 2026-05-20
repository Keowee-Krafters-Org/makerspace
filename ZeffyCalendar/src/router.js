import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: () => import('./components/Calendar.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;