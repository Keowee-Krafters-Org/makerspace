
class Response extends Entity{
  constructor(success, data = {}, message, error) {
    super(); 
    this.success = success || false;
    this.data = data || {};
    this.message = message || '';
    this.error = error || '';
    this.page = data.page || null;  
  }

  
}
