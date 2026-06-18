import { ZeffyAPIFactory } from '../src/ZeffyAPIFactory.js';
import { Assert } from '@makerspace/membership-common';

export class StorageManagerTestRunner {
  constructor() {
    this.factory = new ZeffyAPIFactory();
  }

  test_when_eventManager_getAll__then_response_has_data_and_page() {
    console.log('Running ZeffyStorageManager eventManager.getAll test...');
    return this.factory.eventManager().getAll({ page: { pageSize: 1 } }).then(response => {
      Assert.assert('Response should not be null', true, response != null);
      Assert.assert('Response.success should be true', true, response.success === true);
      Assert.assert('Response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Response page should exist', true, response.page != null);
    });
  }

  test_when_contactManager_getAll__then_response_has_data_and_page() {
    console.log('Running ZeffyStorageManager contactManager.getAll test...');
    return this.factory.contactManager().getAll({ page: { pageSize: 1 } }).then(response => {
      Assert.assert('Response should not be null', true, response != null);
      Assert.assert('Response.success should be true', true, response.success === true);
      Assert.assert('Response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Response page should exist', true, response.page != null);
    });
  }

  test_when_paymentManager_getAll__then_response_has_data_and_page() {
    console.log('Running ZeffyStorageManager paymentManager.getAll test...');
    return this.factory.paymentManager().getAll({ page: { pageSize: 1 } }).then(response => {
      Assert.assert('Response should not be null', true, response != null);
      Assert.assert('Response.success should be true', true, response.success === true);
      Assert.assert('Response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Response page should exist', true, response.page != null);
    });
  }

  runAll() {
    console.log('Running ZeffyStorageManager Integration Tests...');
    Promise.resolve()
      .then(() => this.test_when_eventManager_getAll__then_response_has_data_and_page())
      .then(() => this.test_when_contactManager_getAll__then_response_has_data_and_page())
      .then(() => this.test_when_paymentManager_getAll__then_response_has_data_and_page())
      .then(() => console.log('All ZeffyStorageManager Integration Tests Finished Successfully.'))
      .catch(e => console.error('One or more ZeffyStorageManager tests failed:', e.message));
  }
}
