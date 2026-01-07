import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router';

export function createRouter(session) {
  const routes = [
    { path: '/member', name: 'Member', component: () => import('@/views/member/Member.vue') },
    { path: '/member/landing', name: 'MemberLanding', component: () => import('@/views/member/MemberLanding.vue') },
    { path: '/member/register', name: 'MemberRegistration', component: () => import('@/views/member/MemberRegistration.vue') },
    { path: '/member/waiver', name: 'MemberWaiver', component: () => import('@/views/member/MemberWaiver.vue') },

    { path: '/admin', component: () => import('@/views/admin/Admin.vue'), props: true },
    { path: '/admin/member/:id?', name: 'MemberEditor', component: () => import('@/views/admin/MemberEditor.vue'), props: (route) => ({ id: route.params.id, email: route.query.email }) },

    // Events
    { path: '/event', name: 'Events', component: () => import('@/views/event/Events.vue') },
    // New route for creating an event (reuses EventEditor)
    { path: '/event/new', name: 'EventEditorNew', component: () => import('@/views/event/EventEditor.vue'), props: true },
    { path: '/event/edit/:id?', name: 'EventEditor', component: () => import('@/views/event/EventEditor.vue'), props: true },
    { path: '/event/attendees', component: () => import('@/views/event/EventAttendees.vue'), props: (route) => ({ id: route.query.id }) },
    { path: '/event/view', name: 'EventView', component: () => import('@/views/event/Event.vue'), props: (route) => ({ id: route.query.id, mode: route.query.mode }) },

    { path: '/login', component: () => import('@/views/login/LoginView.vue') },

    {
      path: '/',
      redirect: () => {
        const view = (session?.view || 'event').toString().toLowerCase();
        if (view === 'member') return { path: '/member' };
        const mode = (session?.viewMode || 'list').toString().toLowerCase();
        return { path: '/event', query: { mode, type: 'Class' } };
      },
    },
  ];

  const router = createVueRouter({
    history: createWebHashHistory(),
    routes,
  });

  // Centralized guard: APPLIED -> Waiver; NEW -> Registration; canSignUp -> Landing
  router.beforeEach((to) => {
    const login = (session?.member?.login?.status || '').toString().toUpperCase();
    const reg = (session?.member?.registration?.status || '').toString().toUpperCase();
    const redirect = to.query?.redirect;
    const canSignUp = reg === 'PENDING' || reg === 'REGISTERED';

    if (to.path === '/member' && login === 'VERIFIED') {
      if (reg === 'APPLIED') return { name: 'MemberWaiver', query: redirect ? { redirect } : undefined, replace: true };
      if (reg === 'NEW') return { name: 'MemberRegistration', query: redirect ? { redirect } : undefined, replace: true };
      if (canSignUp) return { name: 'MemberLanding', replace: true };
    }
    return true;
  });

  return router;
}