import { ref } from 'vue';
import Card from '@/components/Card.vue';
import Message from '@/components/Message.vue';
import TextInput from '@/components/TextInput.vue';
import Button from '@/components/Button.vue';

export default {
  name: 'LoginView',
  components: { Card, Message, TextInput, Button },
  props: {
    status: String,
    email: String,
    token: String,
  },
  setup(props) {
    const email = ref(props.email || '');
    const token = ref(props.token || '');

    const requestToken = () => {
      // Call the server-side function to request a token
    };

    const verifyCode = () => {
      // Call the server-side function to verify the token
    };

    const resendToken = () => {
      // Call the server-side function to resend the token
    };

    return { email, token, requestToken, verifyCode, resendToken };
  },
};