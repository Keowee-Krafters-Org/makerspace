import { createRouter, createWebHashHistory } from 'vue-router';
import Member from '@/views/member/Member.vue';
import Admin from '@/views/admin/Admin.vue';
import Event from '@/views/event/Event.vue';

const routes = [
  { path: '/member', component: Member, props: true },
  { path: '/admin', component: Admin, props: true },
  { path: '/event', component: Event, props: true },
  { path: '/', redirect: '/member' }, // Default route
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash-based routing
  routes,
});

export default router;