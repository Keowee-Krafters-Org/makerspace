/**
 * Page model for handling pagination in responses.
 * This class is used to encapsulate pagination details such as current page,
 * total pages, and items per page.
 * It is typically used in conjunction with the Response class to provide
 * structured pagination information in API responses.  
 */
class Page extends Entity {
  constructor(data = {}) {
    super(data);
  }

  toObject() {
    return {
      currentPageMarker: this.currentPageMarker,
      pageSize: this.pageSize,
      hasMore: this.hasMore,
      nextPageMarker: this.nextPageMarker,
      previousPageMarker: this.previousPageMarker
    };
  }

  get currentPageMarker() {
    // Implemented in subclass
    throw new Error('Implemented in subclass');
  }

  get pageSize() {
    throw new Error('Implemented in subclass');
  }
  
  get hasMore() {
    throw new Error('Implemented in subclass');
  } 
  get nextPageMarker() {
    // advance by one page
    return this.hasMore ? this.currentPageMarker + 1 : null;
  } 
  get previousPageMarker() {
    // go back by one page
    return this.currentPageMarker > 1 ? this.currentPageMarker - 1 : null;
  }

  set currentPageMarker(value) {
    throw new Error('Implemented in subclass');
  }

  set pageSize(value) {
    throw new Error('Implemented in subclass');
  }

  set hasMore(value) {
    throw new Error('Implemented in subclass');
  }   

  set nextPageMarker(value) {
    throw new Error('Implemented in subclass');
  }

  set previousPageMarker(value) {
    throw new Error('Implemented in subclass');
  }

  // Remove duplicate setter (this block was duplicated)
  // set previousPageMarker(value) {
  //   throw new Error('Implemented in subclass');
  // }

  set previousPageMarker(value) {
    throw new Error('Implemented in subclass');
  }
  
}

