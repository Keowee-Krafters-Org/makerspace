import { ZeffyAPI } from '../ZeffyAPI.js';
import { config } from '../config.secrets.js';
import { Assert } from '../../MembershipCommon/tests/Assert.js';

export class TestRunner {
  constructor() {
    this.zeffyAPI = new ZeffyAPI(config.zeffy.AuthToken);
  }

  async testGetPayments() {
    console.log('Running getPayments integration test...');
    const response = await this.zeffyAPI.getEntities('payments', { limit: 1 });
    Assert.assert('Response should not be null or undefined', true, response != null);
    Assert.assert('Response data should exist', true, response.data != null);
    Assert.assert('Response data should be an array', true, Array.isArray(response.data));
    Assert.assert('Response data should contain at least one payment', true, response.data.length > 0);
  }

  async testGetCampaigns() {
    console.log('Running getCampaigns integration test...');
    const response = await this.zeffyAPI.getEntities('campaigns', { limit: 1 });
    Assert.assert('Campaigns response should not be null or undefined', true, response != null);
    Assert.assert('Campaigns response data should exist', true, response.data != null);
    Assert.assert('Campaigns response data should be an array', true, Array.isArray(response.data));
    Assert.assert('Campaigns response data should contain at least one campaign', true, response.data.length > 0);
  }

  async testGetContacts() {
    console.log('Running getContacts integration test...');
    const response = await this.zeffyAPI.getEntities('contacts', { limit: 1 });
    Assert.assert('Contacts response should not be null or undefined', true, response != null);
    Assert.assert('Contacts response data should exist', true, response.data != null);
    Assert.assert('Contacts response data should be an array', true, Array.isArray(response.data));
    Assert.assert('Contacts response data should contain at least one contact', true, response.data.length > 0);
  }

  async testGetCampaignById() {
    console.log('Running getCampaignById integration test...');
    const campaignsResponse = await this.zeffyAPI.getEntities('campaigns', { limit: 1 });
    const campaignId = campaignsResponse.data[0].id;
    const response = await this.zeffyAPI.getEntity('campaigns', campaignId);
    Assert.assert('Campaign by ID response should not be null or undefined', true, response != null);
    Assert.assert('Campaign by ID should have a matching ID', campaignId, response.id);
  }

  async testGetContactById() {
    console.log('Running getContactById integration test...');
    const contactsResponse = await this.zeffyAPI.getEntities('contacts', { limit: 1 });
    const contactId = contactsResponse.data[0].id;
    const response = await this.zeffyAPI.getEntity('contacts', contactId);
    Assert.assert('Contact by ID response should not be null or undefined', true, response != null);
    Assert.assert('Contact by ID should have a matching ID', contactId, response.id);
  }

  async runAll() {
    console.log('Running all ZeffyAPI Integration Tests...');
    try {
      await this.testGetPayments();
      await this.testGetCampaigns();
      await this.testGetContacts();
      await this.testGetCampaignById();
      await this.testGetContactById();
      console.log('All ZeffyAPI Integration Tests Finished Successfully.');
    } catch (e) {
      console.error('One or more tests failed:', e.message);
    }
  }
}


