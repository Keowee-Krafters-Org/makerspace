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
        required="true"
        label="Verification Code"
        v-model="verificationCode"
      />

      <Button
        v-if="status === 'UNVERIFIED'"
        label="Verify Email"
        @click="emitRequestToken"
      />
      <Button
        v-if="status === 'VERIFYING'"
        label="Verify Code"
        @click="emitVerifyCode"
      />
      <Button
        v-if="status === 'VERIFYING'"
        label="Resend Code"
        @click="emitResendToken"
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
    member: {
      type: Object,
      required: true,
    },
  },
  computed: {
    status() {
      return this.member.login?.status || 'UNVERIFIED';
    },
  },
  methods: {
    emitRequestToken() {
      this.$emit('request-token', this.email); // Emit the email to the parent
    },
    emitVerifyCode() {
      this.$emit('verify-code', this.verificationCode); // Emit the verification code to the parent
    },
    emitResendToken() {
      this.$emit('resend-token', this.email); // Emit the resend token event to the parent
    },
    async onLogin() {
      // ...existing login logic...
      // After successful login:
      const r = this.$route.query.redirect;
      if (r) {
        try {
          const target = JSON.parse(decodeURIComponent(r));
          this.$router.push(target);
          return;
        } catch {
          // fallback if redirect is a plain path
          this.$router.push(decodeURIComponent(r));
          return;
        }
      }
      // Default fallback
      this.$router.push({ path: '/event' });
    },
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>