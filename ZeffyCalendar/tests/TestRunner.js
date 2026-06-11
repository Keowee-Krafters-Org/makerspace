
import { Assert } from '../../MembershipCommon/tests/Assert.js';

export class TestRunner {
  constructor() {
    this.zeffyAPI = ZeffyAPI.newZeffyAPI();
  }
  test_when_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI integration test...');
    const zeffyAPI = ZeffyAPI.newZeffyAPI();
    return zeffyAPI.getEntities('payments', { limit: 1 }).then(response => {
      Assert.assert('Response should not be null or undefined', response != null, true);
      Assert.assert('Response data should exist', response.data != null, true);
      Assert.assert('Response data should be an array', Array.isArray(response.data), true);
      Assert.assert('Response data should contain at least one payment', response.data.length > 0, true);
    });
  }

  test_when_campaigns_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI campaigns integration test...');
    const zeffyAPI = ZeffyAPI.newZeffyAPI();
    return zeffyAPI.getEntities('campaigns', { limit: 1 }).then(response => {
      Assert.assert('Campaigns response should not be null or undefined', response != null, true);
      Assert.assert('Campaigns response data should exist', response.data != null, true);
      Assert.assert('Campaigns response data should be an array', Array.isArray(response.data), true);
      Assert.assert('Campaigns response data should contain at least one campaign', response.data.length > 0, true);
    });
  }
  
  test_when_contacts_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI contacts integration test...');
    const zeffyAPI = ZeffyAPI.newZeffyAPI();
    return zeffyAPI.getEntities('contacts', { limit: 1 }).then(response => {
      Assert.assert('Contacts response should not be null or undefined', response != null, true);
      Assert.assert('Contacts response data should exist', response.data != null, true);
      Assert.assert('Contacts response data should be an array', Array.isArray(response.data), true);
      Assert.assert('Contacts response data should contain at least one contact', response.data.length > 0, true);
    });
  } 

  /**
   * Test the getEvents function in eventService.js to ensure it returns data correctly.
    * This is an integration test that verifies the end-to-end functionality of fetching events from the Zeffy API.
    * It checks that the response is not null, contains data, and that the data is in the expected format (an array with at least one event).
    * Note: This test assumes that there are events in the Zeffy account. If there are no events, it will fail.
    * In a real testing environment, you would want to mock the API response to ensure consistent test results.
   */
  test_when_get_events_function_is_called__then_data_is_returned() {
    console.log('Running getEvents integration test...');
    return getEvents().then(events => {
      Assert.assert('Events response should not be null or undefined', events != null, true);
      Assert.assert('Events response data should exist', events.data != null, true);
      Assert.assert('Events response data should be an array', Array.isArray(events.data), true);
      Assert.assert('Events response data should contain at least one event', events.data.length > 0, true);
    });
  }

  runAll() {
    console.log('Running all ZeffyAPI Integration Tests...');
    Promise.resolve()
      .then(() => this.test_when_API_is_called__then_data_is_returned())
      .then(() => this.test_when_campaigns_API_is_called__then_data_is_returned())
      .then(() => this.test_when_contacts_API_is_called__then_data_is_returned())
      .then(() => this.test_when_get_events_function_is_called__then_data_is_returned())
      .then(() => console.log('All ZeffyAPI Integration Tests Finished Successfully.'))
      .catch(e => console.error('One or more tests failed:', e.message));
  }
}