const testMember = {
  emailAddress: 'testuser@keoweekrafters.org',
  firstName: 'Testy',
  lastName: 'User',
  phoneNumber: '123-456-7890',
  address: '123 Mock St, Faketown',
  interests: 'Woodworking, Quilting',
  registration: {
    waiverSigned: false,
    status: 'NEW',
    level: 'Interested Party'
  },

};


/**
 * Test that getAllMembers() returns the correct structure
 */
function test_getAllMembers_returns_members() {
  const response = JSON.parse(getAllMembers());
  const found = response.data.find(m => m.emailAddress === testMember.emailAddress);
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

function test_whenMemberIsUpdated_thenMemberData_is_changed () {
  const originalMember = Membership.memberLookup(testMember.emailAddress).member; 
  const memberChanges =  Membership.memberLookup(testMember.emailAddress).member; 
  memberChanges.registration.waiverSigned = !originalMember.registration.waiverSigned; 
  memberChanges.phoneNumber = originalMember.phoneNumber.split('').reverse().join(''); 
  memberChanges.registration.status = originalMember.registration.status.split('').reverse().join('');
  memberChanges.registration.level = originalMember.registration === 2?1:2; 
  const updatedMember=JSON.parse(updateMember(JSON.stringify(memberChanges))).data; 

  assert('Phone number changed', memberChanges.phoneNumber,updatedMember.phoneNumber )
  assert("Waiver Changed", memberChanges.registration.waiverSigned, updatedMember.registration.waiverSigned); 
  assert("Registration Status Changed", memberChanges.registration.status, updatedMember.registration.status); 
  assert("Registration level", memberChanges.registration.level, updatedMember.registration.level); 

}

function when_admin_signs_in__then_admin_gets_access() {
  const memberEmail = testMember.emailAddress;
  const member=JSON.parse(getMemberByEmail(memberEmail));
  doGet({parameter:{view:'admin', adminMode: 'events', memberId:member.data.id}}); 

}
