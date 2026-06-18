import { Response } from '@makerspace/membership-common';
import { ZeffyPage } from './ZeffyPage.js';

export class ZeffyResponse extends Response {
  static getToRecordMap() {
    return {
      success: 'success',
      data: 'data',
      message: 'message',
      error: 'error',
      page: 'page',
    };
  }

  static fromRecord(record = {}) {
    const data = this.convertRecordToData(record, this.getFromRecordMap());
    const page = data.page ? ZeffyPage.fromRecord(data.page) : null;
    return new ZeffyResponse(data.success, data.data, data.message, data.error, page);
  }

  /**
   * @param {boolean} success
   * @param {Array|Object} data
   * @param {string} message
   * @param {string} error
   * @param {ZeffyPage} page
   */
  constructor(success, data = {}, message = '', error = '', page = null) {
    super(success, data, message, error, page);
    // If data is an array and page is not provided, create a default ZeffyPage
    if (Array.isArray(data) && !page) {
      this.page = new ZeffyPage({
        pageSize: data.length,
        hasMore: false,
        currentPageMarker: null,
        nextPageMarker: null,
        previousPageMarker: null
      });
    }
  }
}
