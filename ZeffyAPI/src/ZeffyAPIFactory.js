import { ZeffyAPI } from './ZeffyAPI.js';
import { ZeffyStorageManager } from './storage/ZeffyStorageManager.js';
import { ZeffyEvent } from './storage/ZeffyEvent.js';
import { ZeffyContact } from './storage/ZeffyContact.js';
import { ZeffyPayment } from './storage/ZeffyPayment.js';
/**
 * Factory function to create a new instance of ZeffyAPI. This is required for the client apps since the ZEFFyAPI is wrapped in a global module
 * @returns 
 */


export class ZeffyAPIFactory {
  constructor() {
    this.zeffyAPI = new ZeffyAPI();
  }
   zeffyAPI() {
    return this.zeffyAPI;
  } 

   eventManager() {
    return new ZeffyStorageManager(ZeffyEvent, this.zeffyAPI);
  }

  contactManager() {
    return new ZeffyStorageManager(ZeffyContact, this.zeffyAPI);
  }


  paymentManager() {
    return new ZeffyStorageManager(ZeffyPayment, this.zeffyAPI);
  } 
}
