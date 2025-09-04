/**
 * Page model for handling pagination in responses.
 * This class is used to encapsulate pagination details such as current page,
 * total pages, and items per page.
 * It is typically used in conjunction with the Response class to provide
 * structured pagination information in API responses.  
 */
class Page extends Entity{
    constructor(data = {}) {
      super(data); 
    }
    
    toObject() {
        return {
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        pageSize  : this.pageSize,
        totalItems: this.totalItems
        };
    }
    }