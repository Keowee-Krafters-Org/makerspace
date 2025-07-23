
class ZohoResponse extends Entity{
  constructor(responseData = {}) {
    super(responseData.success, responseData.data, responseData.message, responseData.error, page);
  }

  toObject() {
    return this; 
  }

  static getToRecordMap() {
    return {
      message: 'message',
      error: 'message',
    };
  }

  static fromRecord(record, entities = []) {
    const response = this.convertRecordToData(record, this.getToRecordMap());
    response.success = record.code === 0 || false;
    if (record.page_context) {
      response.page = ZohoPage.fromRecord(record.page_context);
    }
    response.data = entities;
    return response;
  }

}
