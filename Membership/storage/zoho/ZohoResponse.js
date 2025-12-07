
class ZohoResponse extends Entity{
  constructor(responseData = {}) {
    super(responseData);
  }

  
  static getToRecordMap() {
    return {
      message: 'message',
      error: 'message',
    };
  }

  static fromRecord(record, entities = []) {
    const data = this.convertRecordToData(record, this.getToRecordMap());
    const response = new ZohoResponse(data);
    response.success = record.code === 0 || false;
    if (record.page_context) {
      response.page = ZohoPage.fromRecord(record.page_context);
    }
    response.data = entities;
    return response;
  }

}
