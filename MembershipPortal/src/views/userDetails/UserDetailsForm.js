export default {
  name: "UserDetailsForm",
  data() {
    return {
      name: "",
      email: "",
      phone: "",
    };
  },
  methods: {
    handleSubmit() {
      alert(`Name: ${this.name}\nEmail: ${this.email}\nPhone: ${this.phone}`);
      // Add your form submission logic here
    },
  },
};