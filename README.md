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
Assume:
 - You have a Google Workspace Account. You can get a trial account then convert it to a free nonprofit or paid enterprise account.
 - You have node.js and npm installed
To install: 
 - Clone this repo

  ` 
  `
  
 - Install clasp

   ```
   cd makerspace
   npm install clasp
   
   ``` 
