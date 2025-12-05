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
        // Initialize normalized backing fields to safe defaults
        this._currentPage = Number(data.page ?? data.currentPageMarker ?? 1);
        this._pageSize = Number(data.per_page ?? data.pageSize ?? 50);
        this._hasMore = Boolean(data.has_more_page ?? data.hasMore ?? false);
    }
    static getToRecordMap() {
        return {
            _currentPage: 'page',
            _pageSize: 'per_page',
            _hasMore: 'has_more_page',
        };
    }

    get nextPageMarker() {
        return this.hasMore ? this._currentPage + 1 : null;
    }

    set nextPageMarker(value) {
        if (value !== null && value !== undefined) {
            this._currentPage = parseInt(value, 10);
        }
    }

    get currentPageMarker() {
        return this._currentPage;
    }

    set currentPageMarker(value) {
        this._currentPage = parseInt(value, 10);
    }
    get previousPageMarker() {
        return this._currentPage > 1 ? this._currentPage - 1 : null;
    }

    set previousPageMarker(value) {
        if (value !== null && value !== undefined) {
            this._currentPage = parseInt(value, 10);
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

}