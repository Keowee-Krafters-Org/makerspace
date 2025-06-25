/**
 * Open the index page
 */
function doGet(e) {
  const memberId = e.parameter.memberId;
  if (!memberId) {
    return HtmlService.createHtmlOutput('Missing memberId.');
  }

  const response = getMember(memberId);
  if (!response.success) {
    return HtmlService.createHtmlOutput('User not found.');
  }

  const authentication = response.data.login.authentication;
  const isValid = new Date() < new Date(authentication.expirationTime);
  if (!isValid) {
    return HtmlService.createHtmlOutput('Invalid or expired token.');
  }
  const member = response.data;
  // Remove the token for security 
  delete member.login.authentication.token;
  const template = HtmlService.createTemplateFromFile('index');
  template.member = member // inject member directly
  
  return template.evaluate()
    .setTitle('Event Signup')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getEventList() {
  const eventManager = Membership.newEventManager();
  return JSON.stringify(eventManager.getUpcomingEvents()); 
}

function signup(classId, memberId) {
  const eventManager = Membership.newEventManager(); 
  const response = eventManager.signup( classId, memberId ); 
  return JSON.stringify(response);
}

function getSharedConfig() {
  return Membership.SharedConfig;
}

function getMember(memberId) {
  const membershipManager = Membership.newMembershipManager(); 
  return membershipManager.getMember(memberId);
}
