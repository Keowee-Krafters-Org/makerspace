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
  if (Array.isArray(email)) {
    email = email[0];
  }
  email = String(email || '').trim();
  if (!email) throw new Error('No email provided.');

  return Membership.loginMember(email);
}

/**
 * Verifies a submitted token against the stored value via Membership module.
 */
function verifyToken(email, userToken) {
  return Membership.verifyMemberToken(email, userToken);
}

function logout(emailAddress) {
    return Membership.memberLogout(emailAddress); 
}
