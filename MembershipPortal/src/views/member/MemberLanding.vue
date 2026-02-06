<template>
  <div class="member-landing p-4 max-w-2xl mx-auto">
    <Card class="mb-4">
      <template #header>
        <h2 class="text-xl font-bold">Welcome, {{ memberName }}</h2>
      </template>
      <div class="space-y-2">
        <p><strong>Status:</strong> <span :class="statusColor">{{ statusText }}</span></p>
        <p v-if="session?.member?.emailAddress"><strong>Email:</strong> {{ session.member.emailAddress }}</p>
        <p v-if="session?.member?.registration?.level"><strong>Level:</strong> {{ session.member.registration.level }}</p>
      </div>
      <template #footer>
        <div class="flex gap-2">
           <Button v-if="!session?.member" label="Sign Up / Login" @click="onLogin" />
           <Button v-if="isAdmin" label="Admin Dashboard" @click="$router.push('/admin')" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';

export default {
  name: 'MemberLanding',
  components: { Button, Card },
  inject: ['session'],
  computed: {
    memberName() {
      const m = this.session?.member;
      if (!m) return 'Guest';
      return [m.firstName, m.lastName].filter(Boolean).join(' ') || 'Member';
    },
    statusText() {
      const m = this.session?.member;
      if (!m) return 'Not Signed In';
      return m.registration?.status || m.login?.status || 'Unknown';
    },
    statusColor() {
      const s = this.statusText.toUpperCase();
      if (s === 'ACTIVE' || s === 'REGISTERED' || s === 'VERIFIED') return 'text-green-600 font-medium';
      return 'text-gray-500';
    },
    isAdmin() {
      const lvl = (this.session?.member?.registration?.level || '').toString().toUpperCase();
      return ['ADMIN', 'ADMINISTRATOR', 'MANAGER', 'OWNER'].includes(lvl);
    }
  },
  methods: {
    onLogin() {
      // Logic for login or redirect to auth page
      // For now, reload or trigger auth flow if needed
      // Assuming App handles auth via Google/Node connector automatically or via a specific login route
      console.log('Login requested');
    }
  }
};
</script>
