import { ZeffyAPI } from './ZeffyAPI.js';
import { TestRunner } from './tests/TestRunner.js';

// Expose the classes to the global scope for Google Apps Script
globalThis.ZeffyAPI = ZeffyAPI;
globalThis.TestRunner = TestRunner;
