/**
 * Page model for handling pagination in responses.
 * This class is used to encapsulate pagination details such as current page,
 * total pages, and items per page.
 * It is typically used in conjunction with the Response class to provide
 * structured pagination information in API responses.  
 */
class ZohoPage extends Page{
    constructor(data = {}) {
        super(data)
    }
    static getToRecordMap() {
        return {
            currentPage: 'page',
            pageSize: 'per_page',
            hasMore: 'has_more',
        };
    }


}