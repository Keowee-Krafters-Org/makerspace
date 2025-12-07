/**
 * Page model for handling pagination in responses.
 * This class is used to encapsulate pagination details such as current page,
 * total pages, and items per page.
 * It is typically used in conjunction with the Response class to provide
 * structured pagination information in API responses.  
 */
class ZohoPage extends Page{
    constructor(data = {}) {
        super(data);
        this._currentPageMarker = data.currentPageMarker || 1;
        this._pageSize = data.pageSize || 20;
        this._hasMore = data.hasMore || false;
    }
   
    static getToRecordMap() {
        return {
            currentPageMarker: 'page',
            pageSize: 'per_page',
            hasMore: 'has_more_page',
        };
    }

    get nextPageMarker() {
        return this.hasMore ? this._currentPageMarker + 1 : null;
    }

    set nextPageMarker(value) {
        if (value !== null && value !== undefined) {
            this._currentPageMarker = parseInt(value, 10);
        }
    }

    get currentPageMarker() {
        return this._currentPageMarker;
    }

    set currentPageMarker(value) {
        this._currentPageMarker = parseInt(value, 10);
    }
    get previousPageMarker() {
        return this._currentPageMarker > 1 ? this._currentPageMarker - 1 : null;
    }

    set previousPageMarker(value) {
        if (value !== null && value !== undefined) {
            this._currentPageMarker = parseInt(value, 10);
        }
    }

    get hasMore() {
        return this._hasMore;
    } 
    set hasMore(value) {
        this._hasMore = Boolean(value);
    }

    get pageSize() {
        return this._pageSize;
    }
    
    set pageSize(value) {
        this._pageSize = parseInt(value, 10);
    }   

    static fromRecord(record) {
        const data = this.convertRecordToData(record, this.getFromRecordMap());
       return new ZohoPage(data);
    }

}