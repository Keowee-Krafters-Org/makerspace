# Makerspace for Google Workplace

## A collection of forms and AppScripts to function as a simple Makerspace management system

### Features

#### Member Portal (Web App) 
 - Permits login using email verification.
 - Tracks session with timeout
 - Provides menus with access level permissioning
 - Embeds into your web site with a simple url
 - Links to registration and liability waiver forms

#### Admin Portal (Web App)
 - Provides admin level listing and editing of member information
 - Access limited to Admin only

#### Membership (Library)
 - Provides service level API to support Web App and Google Forms calls
   - `login()`
   - `verifyToken()`
   - `getAllMembers()`
   - `memberLookup()`
   - `updateMember()`
 - Interfaces to Member Registry sheet and Zoho Books API for data store

#### Forms
 - Common forms for Makerspace operations
    - Registration
    - Liability Waiver
    - Volunteer Hours
    - Event signup
    - Craft Fair Vendor Signup

## QuickStart

Assumes:
 - You have a Google Workspace Account. You can get a trial account then convert it to a free nonprofit or paid enterprise account.
 - You have node.js and npm installed
 - For Zoho Books API Use:
   - You have enabled API access and created a Client Test Grant token

To install: 
 - Clone this repo

   ```
   git clone https://github.com/your-org/makerspace.git
   cd makerspace
   ```

 - Install clasp

   ```
   npm install -g @google/clasp
   ```

 - Create the project

   ```
   clasp login
   ./createProject.sh
   ```

### Create configuration files

#### ZohoAPI/authConfig.secrets.js

```js
const authConfig = {
    clientId: "Your Zoho Client ID",
    clientSecret: "Your Zoho Client secret",
    redirectUri: "http://localhost",
    authEndpoint: "https://accounts.zoho.com/oauth/v2/auth",
    tokenEndpoint: "https://accounts.zoho.com/oauth/v2/token",
    scope: "ZohoBooks.fullaccess.all",
    grantToken: "Your Client Temporary Test Grant Token",
    accessType: "offline",
    responseType: "code",
    state: "your state here",
    organizationId: "Your Organization ID here",
    apiBaseUrl: "https://www.zohoapis.com/books/v3" 
};

getAuthConfig = () => authConfig;
```

---

## Architecture Notes

- **StorageManager Pattern:**  
  The codebase now uses a base `StorageManager` class with subclasses for each storage backend (e.g., `ZohoStorageManager`, `SheetStorageManager`).  
  Each manager works with a model class (`Member`, `ZohoMember`, `SheetMember`, etc.) that encapsulates both common and storage-specific logic.

- **Model Classes:**  
  - `Member`: Base class for all member data and logic.
  - `ZohoMember`, `SheetMember`: Subclasses that implement `fromRecord` and `toRecord` for their respective storage formats.
  - Similar pattern applies for other entities (e.g., `Event`, `ZohoEvent`, `SheetEvent`).

- **No External Field Maps:**  
  Field mapping is handled within each model subclass, making it easy to add new storage types or change field mappings.

- **File Order with clasp:**  
  If using clasp, ensure your `.clasp.json` `"filePushOrder"` lists files in dependency order, e.g.:
  ```json
  "filePushOrder": [
    "StorageManager.js",
    "Member.js",
    "ZohoMember.js",
    "SheetMember.js",
    "ZohoStorageManager.js",
    "SheetStorageManager.js",
    "IntegrationTests.js"
  ]
  ```

---

## Testing

- Integration tests are provided for both member and event storage using the new storage structure.
- See `IntegrationTests.js` for examples of how to use the storage managers and model classes together.

---