const testMember = {
  emailAddress: 'testuser@keoweekrafters.org',
  firstName: 'Testy',
  lastName: 'User',
  phoneNumber: '123-456-7890',
  address: '123 Mock St, Faketown',
  interests: 'Woodworking, Quilting',
  level: 2
};

/** 
 * Assert block for tests
 */
const assert = (label, expected, actual) => {
  if (expected !== actual) {
    throw new Error(`${label} mismatch. Expected: ${expected}, Got: ${actual}`);
  } else {
    Logger.log(`${label} verified: ${actual}`);
  }
};

/**
 * Test that getAllMembers() returns the correct structure
 */
function test_getAllMembers_returns_members() {
  const all = JSON.parse(getAllMembers());
  const found = all.data.find(m => m.emailAddress === testMember.emailAddress);
  assert('Found registered member', true, !!found);
  assert('First name matches', testMember.firstName, found.firstName);
}

function test_whenUserLandsOnPageWithEmail_thenUserIsAllowedIn() {
  let lookup = Membership.addMember(testMember); 
  lookup = Membership.memberLookup(testMember.emailAddress);
  const result = doGet({parameter: {emailAddress: testMember.emailAddress}}); 
  assert("Result", true, result); 
}

function test_whenMemberIsLookedup_thenMemberisReturned() {
  let lookup = JSON.parse(getMemberByEmail(testMember.emailAddress)); 
  assert("Member", testMember.emailAddress, lookup.data.emailAddress); 
}