import { Response } from '@makerspace/membership-common';
import { ZeffyPage } from './ZeffyPage.js';

export class ZeffyResponse extends Response {
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
