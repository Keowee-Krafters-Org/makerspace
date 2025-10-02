import { createRouter, createWebHashHistory } from 'vue-router';
import Member from '@/views/member/Member.vue';
import Admin from '@/views/admin/Admin.vue';
import Events from '@/views/event/Events.vue';

const routes = [
  { path: '/member', component: Member, props: true },
  { path: '/admin', component: Admin, props: true },
  { path: '/event', component: Events, props: true },
  { path: '/', redirect: '/event' }, // Default route
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash-based routing
  routes,
});

export default router;