import { Page } from '@makerspace/membership-common';

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

  static fromRecord(record) {
    const data = this.convertRecordToData(record, this.getToRecordMap());
    return new ZeffyPage(data);
  }
}
