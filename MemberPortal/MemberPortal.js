// Google Apps Script Web App for Member Login via Email Verification with Dashboard
// Sheet must have named ranges including 'emailAddress', 'firstName', 'lastName', 'status', 'timestamp', and 'authentication'

/**
 * Render the member portal interface, injecting any authenticated user info.
 */
function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Sends a verification token to the user's email via Membership module.
 */
function login(email) {

  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  if (Array.isArray(email)) {
    email = email[0];
  }
  email = String(email || '').trim();
  if (!email) throw new Error('No email provided.');
  const response = membershipManager.loginMember(email);
  delete response.data.login.authentication.token;
  return JSON.stringify(response);
}

/**
 * Verifies a submitted token against the stored value via Membership module.
 */
function verifyToken(email, userToken) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  const response = membershipManager.verifyMemberToken(email, userToken);
  delete response.data.login.authentication.token;
  return JSON.stringify(response);
}

function logout(emailAddress) {
  const modelFactory = Membership.newModelFactory();
  const membershipManager = modelFactory.membershipManager();
  return JSON.stringify(membershipManager.memberLogout(emailAddress));
}

function getLevelNumber(levelString) {
  const levels = getConfig();
  for (const key in levels) {
    if (levels[key] === levelString) {
      return key;
    }
  }
  return null; // Return null if no matching level is found
}

