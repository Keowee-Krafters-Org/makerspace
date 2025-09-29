<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/member/Member.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Member Info</h2>
    <LoginView
      v-if="session.member.login.status !== 'LOGGED_IN'"
      :session="session"
    />
    <UserDetailView
      v-else
      :session="session"
    />
  </div>
</template>

<script>
import LoginView from '@/views/login/LoginView.vue';
import UserDetailView from '@/views/userDetails/UserDetailsForm.vue';

export default {
  name: 'Member',
  components: {
    LoginView,
    UserDetailView,
  },
  props: {
    session: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>