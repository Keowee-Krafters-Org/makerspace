<template>
  <div class="login-view">
    <Card>
      <Message
        v-if="status === 'UNVERIFIED'"
        type="info"
        message="Please verify your email to continue."
      />
      <Message
        v-if="status === 'TOKEN_EXPIRED'"
        type="error"
        message="Your token has expired. Please request a new one."
      />
      <Message
        v-if="status === 'VERIFYING'"
        type="info"
        message="A verification code has been sent to your email."
      />

      <TextInput
        v-if="status === 'UNVERIFIED' || status === 'TOKEN_EXPIRED'"
        label="Email Address"
        v-model="email"
        :disabled="status === 'VERIFYING'"
      />
      <TextInput
        v-if="status === 'VERIFYING'"
        label="Verification Code"
        v-model="verificationCode"
      />

      <Button
        v-if="status === 'UNVERIFIED'"
        label="Verify Email"
        @click="requestToken"
      />
      <Button
        v-if="status === 'VERIFYING'"
        label="Verify Code"
        @click="verifyCode"
      />
      <Button
        v-if="status === 'VERIFYING'"
        label="Resend Code"
        @click="resendToken"
      />
    </Card>
  </div>
</template>

<script>
import Card from '@/components/Card.vue';
import Message from '@/components/Message.vue';
import TextInput from '@/components/TextInput.vue';
import Button from '@/components/Button.vue';

export default {
  name: 'LoginView',
  components: {
    Card,
    Message,
    TextInput,
    Button,
  },
  props: {
    session: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      email: '',
      verificationCode: '',
      status: this.session.member.login.status,
    };
  },
  methods: {
    requestToken() {
      this.session.memberPortal.requestToken(this.email);
    },
    verifyCode() {
      this.session.memberPortal.verifyCode(this.verificationCode);
    },
    resendToken() {
      this.session.memberPortal.resendToken();
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>