
class Response extends Entity{
  constructor(success, data = {}, message, error, page) {
    super(); 
    this.success = success || false;
    this.data = data || {};
    this.message = message || '';
    this.error = error || '';
    this.page = page || null;  
  }
 
}
