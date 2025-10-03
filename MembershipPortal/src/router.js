import { createRouter, createWebHashHistory } from 'vue-router';
import Member from '@/views/member/Member.vue';
import Admin from '@/views/admin/Admin.vue';
import EventAttendees from '@/views/event/EventAttendees.vue';
import EventEditor from '@/views/event/EventEditor.vue';

const routes = [
  { path: '/member', component: Member, props: true },
  { path: '/admin', component: Admin, props: true },
  { path: '/event', component: () => import('@/views/event/Events.vue') },
  { path: '/event/edit/:id?', name: 'EventEditor', component: EventEditor, props: true },
  { path: '/event/attendees', component: EventAttendees, props: (route) => ({ id: route.query.id }) },
  { path: '/event/view', name: 'EventView', component: () => import('@/views/event/Event.vue'), props: (route) => ({ id: route.query.id, mode: route.query.mode }) },
  { path: '/login', component: () => import('@/views/login/LoginView.vue') },
  { path: '/', redirect: '/event' }, // Default route
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash-based routing
  routes,
});

export default router;