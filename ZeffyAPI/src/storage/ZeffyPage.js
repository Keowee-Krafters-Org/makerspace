import { Page } from '@makerspace/membership-common';

/**
 * ZeffyPage is a class that represents pagination information for API responses from Zeffy. It extends the base Page class and includes additional properties specific to Zeffy's pagination system, such as currentPageMarker, pageSize, hasMore, nextPageMarker, and previousPageMarker. The class also provides methods to convert between the ZeffyPage instance and a record format suitable for API requests and responses.
 * This class is used in the ZeffyStorageManager to handle paginated responses from the Zeffy API, allowing for easy navigation through pages of data.
 */
export class ZeffyPage extends Page {
  constructor(data = {}) {
    super(data);
    this._currentPageMarker = data.currentPageMarker || null;
    this._pageSize = data.pageSize || 0;
    this._hasMore = data.hasMore || false;
    this._nextPageMarker = data.nextPageMarker || null;
    this._previousPageMarker = data.previousPageMarker || null;
  }

  get currentPageMarker() {
    return this._currentPageMarker;
  }
  set currentPageMarker(value) {
    this._currentPageMarker = value;
  }

  get pageSize() {
    return this._pageSize;
  }
  set pageSize(value) {
    this._pageSize = value;
  }

  get hasMore() {
    return this._hasMore;
  }
  set hasMore(value) {
    this._hasMore = value;
  }

  get nextPageMarker() {
    return this._nextPageMarker;
  }
  set nextPageMarker(value) {
    this._nextPageMarker = value;
  }

  get previousPageMarker() {
    return this._previousPageMarker;
  }
  set previousPageMarker(value) {
    this._previousPageMarker = value;
  }

  static getToRecordMap() {
    return {
      currentPageMarker: 'starting_after',
      pageSize: 'limit',
      hasMore: 'has_more',
      nextPageMarker: 'next_cursor',
      previousPageMarker: 'previous_cursor',
    };
  }

  /**
   * Converts the ZeffyPage instance to a record format suitable for API requests.
   * It uses the mapping defined in getToRecordMap to translate property names to API parameter names.
   * @returns {object} A record object with keys corresponding to API parameters.
   */
  toRecord() {
    const record = super.toRecord();
    return Object.fromEntries(
      Object.entries(record).filter(([, value]) => value !== null && value !== undefined)
    );
  }

  /**
   * Creates a ZeffyPage instance from a record object, typically received from an API response.
   * It uses the mapping defined in getToRecordMap to translate API parameter names to property names.
   * @param {object} record - The record object with keys corresponding to API parameters.
   * @returns {ZeffyPage} A ZeffyPage instance populated with data from the record.
   */
  static fromRecord(record) {
    const data = this.convertRecordToData(record, this.getToRecordMap());
    return new ZeffyPage(data);
  }
}
