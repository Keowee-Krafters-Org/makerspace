import { ZeffyAPI } from '../src/ZeffyAPI.js';
import { config } from '../config.secrets.js';
import { Assert } from '@makerspace/membership-common';

export class TestRunner {
  constructor() {
    this.zeffyAPI = new ZeffyAPI();
    this.zeffyAPIFactory = new ZeffyAPIFactory();
  }

  testGetPayments() {
    console.log('Running getPayments integration test...');
    return this.zeffyAPI.getEntities('payments', { limit: 1 }).then(response => {
      Assert.assert('Response should not be null or undefined', true, response != null);
      Assert.assert('Response data should exist', true, response.data != null);
      Assert.assert('Response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Response data should contain at least one payment', true, response.data.length > 0);
    });
  }

  testGetCampaigns() {
    console.log('Running getCampaigns integration test...');
    return this.zeffyAPI.getEntities('campaigns', { limit: 1 }).then(response => {
      Assert.assert('Campaigns response should not be null or undefined', true, response != null);
      Assert.assert('Campaigns response data should exist', true, response.data != null);
      Assert.assert('Campaigns response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Campaigns response data should contain at least one campaign', true, response.data.length > 0);
    });
  }

  testGetContacts() {
    console.log('Running getContacts integration test...');
    return this.zeffyAPI.getEntities('contacts', { limit: 1 }).then(response => {
      Assert.assert('Contacts response should not be null or undefined', true, response != null);
      Assert.assert('Contacts response data should exist', true, response.data != null);
      Assert.assert('Contacts response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Contacts response data should contain at least one contact', true, response.data.length > 0);
    });
  }

  testGetCampaignById() {
    console.log('Running getCampaignById integration test...');
    return this.zeffyAPI.getEntities('campaigns', { limit: 1 }).then(campaignsResponse => {
      const campaignId = campaignsResponse.data[0].id;
      return this.zeffyAPI.getEntityById('campaigns', campaignId).then(response => {
        Assert.assert('Campaign by ID response should not be null or undefined', true, response != null);
        Assert.assert('Campaign by ID should have a matching ID', campaignId, response.id);
      });
    });
  }

  testGetContactById() {
    console.log('Running getContactById integration test...');
    return this.zeffyAPI.getEntities('contacts', { limit: 1 }).then(contactsResponse => {
      const contactId = contactsResponse.data[0].id;
      return this.zeffyAPI.getEntityById('contacts', contactId).then(response => {
        Assert.assert('Contact by ID response should not be null or undefined', true, response != null);
        Assert.assert('Contact by ID should have a matching ID', contactId, response.id);
      });
    });
  }

  test_when_eventManager_gets_events__then_data_is_returned() {
    console.log('Running getEvents via ZeffyEventManager integration test...');
    const eventManager = this.zeffyAPIFactory.eventManager();
    const page = { pageSize: 20 };
    return eventManager.getAll({ page: { ...page } }).then(response => {
      Assert.assert('Events response should not be null or undefined', true, response != null);
      Assert.assert('Events response data should exist', true, response.data != null);
      Assert.assert('Events response data should be an array', true, Array.isArray(response.data));
      Assert.assert('Events response data should contain at least one event', true, response.data.length > 0);
    });
  } 

  testGetCampaignsByCategory() {
    console.log('Running getCampaignsByCategory integration test...');
    const filter = { field: 'category', operator: 'equals', value: 'Event' };
    return this.zeffyAPI.getEntitiesByFilter('campaigns', {}, filter).then(response => {
      Assert.assert('Campaigns by category response should not be null or undefined', true, response != null);
      Assert.assert('Campaigns by category response should be an array', true, Array.isArray(response.data));
      Assert.assert('Campaigns by category response should contain at least one campaign', true, response.data.length > 0);
      Assert.assert('All campaigns should have category "Event"', true, response.data.every(c => c.category === 'Event'));
    });
  }

  runAll() {
    console.log('Running all ZeffyAPI Integration Tests...');
    Promise.resolve()
      .then(() => this.testGetPayments())
      .then(() => this.testGetCampaigns())
      .then(() => this.testGetContacts())
      .then(() => this.testGetCampaignById())
      .then(() => this.testGetContactById())
      .then(() => this.testGetCampaignsByCategory())
      .then(() => this.test_when_eventManager_gets_events__then_data_is_returned())
      .then(() => console.log('All ZeffyAPI Integration Tests Finished Successfully.'))
      .catch(e => console.error('One or more tests failed:', e.message));
  }
}


