
import { Assert } from '../../MembershipCommon/tests/Assert.js';

export class TestRunner {
  constructor() {
    this.factory = ZeffyAPI.newZeffyAPIFactory();
    this.eventManager = this.factory.eventManager();
    this.contactManager = this.factory.contactManager();
    this.paymentManager = this.factory.paymentManager();
  }

  getTests() {
    return [
      {
        name: 'test_when_API_is_called__then_data_is_returned',
        status: 'PASS',
        fn: () => this.test_when_API_is_called__then_data_is_returned(),
      },
      {
        name: 'test_when_campaigns_API_is_called__then_data_is_returned',
        status: 'PASS',
        fn: () => this.test_when_campaigns_API_is_called__then_data_is_returned(),
      },
      {
        name: 'test_when_contacts_API_is_called__then_data_is_returned',
        status: 'PASS',
        fn: () => this.test_when_contacts_API_is_called__then_data_is_returned(),
      },
      {
        name: 'test_when_get_events_function_is_called__then_data_is_returned',
        status: 'NEW',
        fn: () => this.test_when_get_events_function_is_called__then_data_is_returned(),
      },
    ];
  }

  test_when_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI integration test...');
    return this.paymentManager.getAll({ page: { pageSize: 1 } }).then(response => {
      Assert.assert('Response should not be null or undefined', response != null, true);
      Assert.assert('Response data should exist', response.data != null, true);
      Assert.assert('Response data should be an array', Array.isArray(response.data), true);
      Assert.assert('Response data should contain at least one payment', response.data.length > 0, true);
    });
  }

  test_when_campaigns_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI campaigns integration test...');
    return this.eventManager.getAll({ page: { pageSize: 1 } }).then(response => {
      Assert.assert('Campaigns response should not be null or undefined', response != null, true);
      Assert.assert('Campaigns response data should exist', response.data != null, true);
      Assert.assert('Campaigns response data should be an array', Array.isArray(response.data), true);
      Assert.assert('Campaigns response data should contain at least one campaign', response.data.length > 0, true);
    });
  }
  
  test_when_contacts_API_is_called__then_data_is_returned() {
    console.log('Running ZeffyAPI contacts integration test...');
    return this.contactManager.getAll({ page: { pageSize: 1 } }).then(response => {
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

  runAll(status = null) {
    const allTests = this.getTests();
    const requestedStatuses = status == null
      ? null
      : (Array.isArray(status) ? status : [status]).map((s) => String(s).toUpperCase());

    const tests = allTests.filter((test) => {
      const testStatus = String(test.status || '').toUpperCase();
      if (!requestedStatuses || requestedStatuses.length === 0) {
        return testStatus !== 'SKIP';
      }
      return requestedStatuses.includes(testStatus);
    });

    console.log(`Running ZeffyAPI Integration Tests${requestedStatuses ? ` for status: ${requestedStatuses.join(', ')}` : ' (excluding SKIP)'}...`);

    if (tests.length === 0) {
      console.log('No tests matched the requested status filter.');
      return Promise.resolve();
    }

    const failures = [];

    return tests
      .reduce((promise, test) => {
        return promise.then(() => {
          return Promise.resolve()
            .then(() => test.fn())
            .catch((e) => {
              failures.push({ name: test.name, status: test.status, error: e });
              console.error(`Test failed [${test.status}]: ${test.name}`, e && e.message ? e.message : e);
            });
        });
      }, Promise.resolve())
      .then(() => {
        if (failures.length === 0) {
          console.log(`All ${tests.length} selected ZeffyAPI Integration Tests Finished Successfully.`);
          return;
        }

        console.error(`${failures.length} test(s) failed.`);
        failures.forEach((failure) => {
          console.error(`- [${failure.status}] ${failure.name}:`, failure.error && failure.error.message ? failure.error.message : failure.error);
        });
      });
  }
}