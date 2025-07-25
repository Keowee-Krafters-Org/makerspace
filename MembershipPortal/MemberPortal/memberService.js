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


