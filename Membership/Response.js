
class Response {
  constructor(success, data = {}, message, error) {
    this.success = success; 
    this.message = message; 
    this.error = error;
    this.data = data;
    this. redirectToForm = false; 
  }

  toObject() {
    return this; 
  }
}
