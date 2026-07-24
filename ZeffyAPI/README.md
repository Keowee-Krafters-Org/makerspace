# ZeffyAPI

A JavaScript wrapper for the Zeffy API, designed to be used in Google Apps Script and other Node.js environments.

## Installation

This module is part of a larger monorepo. To use it, you'll need to have the dependencies installed from the root of the `makerspace` project.

## Configuration

1.  Copy the `config.secrets.template.js` file to `config.secrets.js`.
2.  Fill in your Zeffy API key in `config.secrets.js`:

```javascript
// config.secrets.js
export const config = {
    "zeffy": {
        "AuthToken": "YOUR_ZEFFY_API_KEY"
    }
}
```

## Usage

First, you need to get an instance of the `ZeffyAPI` from the `ZeffyAPIFactory`.

```javascript
import { ZeffyAPIFactory } from './src/ZeffyAPIFactory.js';

const zeffyAPI = ZeffyAPIFactory.getApi();

// Now you can use the zeffyAPI object to make requests to the Zeffy API.
```

### Fetching data

You can fetch various types of data from the Zeffy API.

#### Get all contacts
```javascript
zeffyAPI.getAll("contacts")
    .then(contacts => console.log(contacts))
    .catch(error => console.error(error));
```

#### Get a specific contact
```javascript
const contactId = "some-contact-id";
zeffyAPI.get("contacts", contactId)
    .then(contact => console.log(contact))
    .catch(error => console.error(error));
```

#### Get all events
```javascript
zeffyAPI.getAll("events")
    .then(events => console.log(events))
    .catch(error => console.error(error));
```

## API Reference

The `ZeffyAPI` class provides a set of methods for interacting with the Zeffy API.

### `getAll(entityType, params)`

Fetches a list of entities of a given type.

-   `entityType` (string): The type of entity to fetch (e.g., 'contacts', 'events', 'payments').
-   `params` (object): An object of query parameters to filter the results.

### `get(entityType, id, params)`

Fetches a single entity by its ID.

-   `entityType` (string): The type of entity to fetch.
-   `id` (string): The ID of the entity to fetch.
-   `params` (object): An object of query parameters.

### `getResponses(formId, params)`

Fetches all responses for a given form.

-   `formId` (string): The ID of the form.
-   `params` (object): An object of query parameters.

### `getRegistrations(eventId, params)`

Fetches all registrations for a given event.

-   `eventId` (string): The ID of the event.
-   `params` (object): An object of query parameters.


## Development

This module uses Vite for building.

### Build for production
```bash
npm run build
```

### Build for development
```bash
npm run dev
```

### Deploy to Google Apps Script
```bash
npm run deploy
```
This will build the project and then push the code to your Google Apps Script project using `clasp`.
