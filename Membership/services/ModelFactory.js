import { Response } from '../models/Response.js';
import { Member } from '../models/Member.js';
import { Login } from '../models/Login.js';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { CalendarManager } from '../storage/google/calendar/CalendarManager.js';
import { EventManager } from './EventManager.js';
import { MembershipManager } from './MembershipManager.js';
import { VendorManager } from './VendorManager.js';
import { WaiverManager } from './WaiverManager.js';
import { InvoiceManager } from './InvoiceManager.js';
import { GoogleDriveService } from '../storage/google/drive/GoogleDriveService.js';
import { ZohoStorageManager, ZohoEvent, ZohoMember, ZohoInstructor, ZohoInvoice } from '../storage/zoho/ZohoStorageManager.js';
import { FormStorageManager, FormWaiver } from '../storage/form/FormStorageManager.js';
import { ConfigProvider, createConfig } from '../config.js';

/**
 * Factory class for creating and managing various models and services within the Membership application.
 * 
 * @class
 * @param {Object} config - Optional configuration object for service initialization.
 * 
 * @property {Object} config - The configuration object used for initializing services.
 * 
 * @example
 * const factory = new ModelFactory(appConfig);
 * const member = factory.member({ name: 'John Doe' });
 */
export class ModelFactory {
  constructor(configSource) {
    this._configProvider = this.normalizeConfigProvider(configSource);
    this._config = this._configProvider.getConfig();
  }

  normalizeConfigProvider(configSource) {
    if (!configSource) {
      return createConfig();
    }

    if (configSource instanceof ConfigProvider) {
      return configSource;
    }

    if (typeof configSource.getConfig === 'function') {
      return {
        getConfig: () => configSource.getConfig(),
      };
    }

    return {
      getConfig: () => configSource,
    };
  }
  response(success, data = {}, message, error) {
    return new Response(success, data, message, error);
  }

  member(data = {}) {
    return new Member(data);
  }

  login(data = {}) {
    return new Login(data);
  }

  registration(data = {}) {
    return new Registration(data);
  }

  calendarManager() {
    const calendarId = this._config.calendarId;
    return new CalendarManager(calendarId, this._config);
  }

  eventManager() {
    return new EventManager(new ZohoStorageManager(ZohoEvent), 
    this.calendarManager(),
    this.membershipManager(), 
    this.googleDriveService(),
    this.invoiceManager(),
    this.googleDriveService(),
    this.vendorManager(),
    this._config
    );
  }

  membershipManager() {
    return new MembershipManager(new ZohoStorageManager(ZohoMember), this.invoiceManager(), this._config);
  }

  vendorManager() {
    return new VendorManager(new ZohoStorageManager(ZohoInstructor));
  }

  event(data = {}) {
    return new Event(data);
  }

  waiverManager() {
    return new WaiverManager(new FormStorageManager(FormWaiver, this._config), this.membershipManager(), this._config);
  }

  invoiceManager() {
    return new InvoiceManager(new ZohoStorageManager(ZohoInvoice), new ZohoStorageManager(ZohoEvent), this._config);
  }
  googleDriveService() {
    return new GoogleDriveService(this._config); 
  }
  /**
   * The system configuration
   * @returns the injected configuration file
   */
  get config() { 
    return this._config; 
  }

  set config(config ) {
    this._configProvider = this.normalizeConfigProvider(config);
    this._config = this._configProvider.getConfig();
  }
}

function newModelFactory() {
  return new ModelFactory(createConfig());
}


