import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router';
import Member from '@/views/member/Member.vue';
import MemberLanding from '@/views/member/MemberLanding.vue';
import Admin from '@/views/admin/Admin.vue';
import EventAttendees from '@/views/event/EventAttendees.vue';
import EventEditor from '@/views/event/EventEditor.vue';

export function createRouter(session) {
  const routes = [
    { path: '/member', component: Member, props: true },
    { path: '/member/landing', name: 'MemberLanding', component: MemberLanding },
    { path: '/member/register', name: 'MemberRegistration', component: () => import('@/views/member/MemberRegistration.vue') },
    { path: '/admin', component: Admin, props: true },
    { path: '/admin/member/:id?', name: 'MemberEditor', component: () => import('@/views/admin/MemberEditor.vue'), props: (route) => ({ id: route.params.id, email: route.query.email }) },
    { path: '/event', component: () => import('@/views/event/Events.vue') },
    { path: '/event/edit/:id?', name: 'EventEditor', component: EventEditor, props: true },
    { path: '/event/attendees', component: EventAttendees, props: (route) => ({ id: route.query.id }) },
    { path: '/event/view', name: 'EventView', component: () => import('@/views/event/Event.vue'), props: (route) => ({ id: route.query.id, mode: route.query.mode }) },
    { path: '/login', component: () => import('@/views/login/LoginView.vue') },
    {
      path: '/',
      redirect: () => {
        const view = (session?.view || 'event').toString().toLowerCase();
        if (view === 'member') return { path: '/member' };
        const mode = (session?.viewMode || 'list').toString().toLowerCase();
        return { path: '/event', query: { mode } };
      },
    },
    { path: '/member/waiver', name: 'MemberWaiver', component: () => import('@/views/member/MemberWaiver.vue') },
  ];

  const router = createVueRouter({
    history: createWebHashHistory(),
    routes,
  });

  // Extend guard: if VERIFIED + NEW, go to MemberRegistration; if VERIFIED + REGISTERED, go to MemberLanding
  router.beforeEach((to) => {
    const status = (session?.member?.login?.status || '').toString().toUpperCase();
    const reg = (session?.member?.registration?.status || '').toString().toUpperCase();
    const hasRedirect = !!to.query?.redirect;
    if (to.path === '/member' && !hasRedirect && status === 'VERIFIED') {
      if (reg === 'NEW') return { name: 'MemberRegistration', replace: true };
      if (reg === 'REGISTERED') return { name: 'MemberLanding', replace: true };
    }
    return true;
  });

  return router;
}