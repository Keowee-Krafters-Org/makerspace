<!-- filepath: /home/csmith/Development/makerspace/MembershipPortal/src/views/member/Member.vue -->
<template>
  <div>
    <!-- Render LoginView if the member is unverified or verifying -->
    <LoginView
      v-if="member.login.status === 'UNVERIFIED' || member.login.status === 'VERIFYING'"
      :member="member"
      @request-token="requestToken"
      @verify-code="verifyCode"
      @resend-token="resendToken"
    />

    <!-- Render MemberLanding if the member is verified and registered -->
    <MemberLanding
      v-else-if="member.login.status === 'VERIFIED' && member.registration.status === 'REGISTERED'"
      :member="member"
    />

    <!-- Render UserDetailView for other verified members -->
    <UserDetailView
      v-else
      :member="member"
    />
  </div>
</template>

<script>
import LoginView from '@/views/login/LoginView.vue';
import UserDetailView from '@/views/userDetails/UserDetailsForm.vue';
import MemberLanding from '@/views/memberLanding/MemberLanding.vue';

export default {
  name: 'Member',
  components: {
    LoginView,
    UserDetailView,
    MemberLanding,
  },
  inject: ['logger', 'session', 'memberPortal'], // Inject dependencies
  data() {
    return {
      member: this.session.member, // Initialize member from the session
    };
  },
  methods: {
    async requestToken(email) {
      try {
        const updatedMember = await this.memberPortal.requestToken(email);
        this.member = updatedMember; // Update the member object
        this.logger.info('Token requested successfully:', updatedMember);
      } catch (error) {
        this.logger.error('Failed to request token:', error.message);
      }
    },
    async verifyCode(verificationCode) {
      try {
        const updatedMember = await this.memberPortal.verifyCode(this.member.emailAddress, verificationCode);
        this.member = updatedMember; // Update the member object
        this.logger.info('Code verified successfully:', updatedMember);
      } catch (error) {
        this.logger.error('Failed to verify code:', error.message);
      }
    },
    async resendToken() {
      try {
        const updatedMember = await this.memberPortal.resendToken();
        this.member = updatedMember; // Update the member object
        this.logger.info('Token resent successfully:', updatedMember);
      } catch (error) {
        this.logger.error('Failed to resend token:', error.message);
      }
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>