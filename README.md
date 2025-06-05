# Makerspace for Google Workplace
## A collection of forms and AppScripts to function as a simple Makerspace management system
### Features
#### Member Portal (Web App) 
 - Permits login using email verification.
 - Tracks session with timeout
 - Provides menus with access level permissioning
 - Embeds into your web site with a simple url
 - Links to registration and laibility waiver forms
#### Admin Portal (Web App)
 - Provides admin level listing and editing of member information
 - Access limited to Admin only
#### Membership (Library)
 - Provides service level API to support Web App and Google Forms calls
   - login()
   - verifyToken()
   - getAllMembers()
   - memberLookup()
   - updateMember()
 - Interfaces to Member Registry sheet for data store
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
  - For Zoho Books API Use 
   - You have enabled the API access and created a Client Test Grant token
To install: 
 - Clone this repo

  ` 
  `
  
 - Install clasp

   ```
   cd makerspace
   npm install -g @google/clasp
   
   ``` 
 - Create the project

```
# In makerspace
clasp login
./createProject.sh

```
### Create configuration files

#### ZohoAPI/authConfig.secrets.js
```
const authConfig = {
    clientId: "Your Zoho Client ID",
    clientSecret: "Your Zoho Client secret",
    redirectUri: "http://localhost",
    authEndpoint: "https://accounts.zoho.com/oauth/v2/auth",
    tokenEndpoint: "https://accounts.zoho.com/oauth/v2/token",
    scope: "ZohoBooks.fullaccess.all",
    grantToken: "Your Client Temporary Test Grant Token,
    accessType: "offline",
    responseType: "code",
    state: "your state here",
    organizationId: "Your Organization ID here",
    apiBaseUrl: "https://www.zohoapis.com/books/v3" 
};

getAuthConfig = () => authConfig;

```