// Admin Portal entry point and service functions

/**
 * Serves the admin interface only if a valid email+token is provided
 * and the user is authorized at Administrator level or above.
 */
function doGet(e) {
  const email = e.parameter.emailAddress;

  // Require both email and token parameters
  if (!email) {
    return HtmlService.createHtmlOutput('Missing email or token.');
  }

  // Look up the member by email
  const lookup = memberLookup(email);
  if (!lookup.found) {
    return HtmlService.createHtmlOutput('User not found.');
  }

  // Check token validity and expiration
  const authentication = lookup.member.login.authentication; 
  const isValid = new Date() < new Date(authentication.expirationTime);

  if (!isValid) {
    return HtmlService.createHtmlOutput('Invalid or expired token.');
  }

  const config = getSharedConfig(); 
  // Require admin-level access
  if (lookup.level < config.levels.Administrator) {
    return HtmlService.createHtmlOutput('Access denied. Not an admin.');
  }

  // Serve the admin panel HTML
  return HtmlService.createHtmlOutputFromFile('admin')
    .setTitle('Admin Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function memberLookup(email) {
  return Membership.memberLookup(email);
}

/**
 * Sends a verification token to the user's email via Membership module.
 */
function login(email) {
  if (Array.isArray(email)) {
    email = email[0];
  }
  email = String(email || '').trim();
  if (!email) throw new Error('No email provided.');

  return Membership.loginMember(email);
}

/**
 * Returns all members for admin listing.
 */
function getAllMembers() {
  const members = Membership.getAllMembers(); 
  const response = Membership.makeResponse(true,members ); 
  return JSON.stringify(response);
}

/**
 * Retrieves a member by their email address.
 */
function getMemberByEmail(email) {
  const lookup = memberLookup(email);
  if (!lookup.found) throw new Error('Member not found');

  return JSON.stringify(Membership.makeResponse(true, lookup.member.toObjectNoAuthentication()));
}

/**
 * Updates a member's record with new information.
 * @param {Object} updatedMember - The member object with updated data.
 */
function updateMember(updatedMemberJson) {
  const savedMember = Membership.updateMember(JSON.parse( updatedMemberJson));
  return JSON.stringify(Membership.makeResponse(true, savedMember.toObjectNoAuthentication()));
}

/**
 * Provides the SharedConfig object to the client-side web app.
 */
function getSharedConfig() {
  return Membership.SharedConfig;
}


