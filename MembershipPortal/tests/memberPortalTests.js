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

const emailAddress = 'christopher.smith@keoweekrafters.org';
function test_that_when_a_member_is_found_by_id__then_the_member_is_returned() {
  const memberId = '12345';
  const expectedMember = {
    id: memberId,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: '',
    registration: { status: 'REGISTERED', level: 'Gold' },
    login: { status: 'VERIFIED', authentication : { token: 'abc123', expirationTime: '2023-10-01T00:00:00Z' } }
  };
  const memberShipManager =  Membership.newModelFactory().membershipManager();
  const member = memberShipManager.memberLookup(emailAddress);
  assert( 'Member should be found', true, member != undefined);
  assert( 'Member email  should match', emailAddress, member.emailAddress );
}

function test_that_when_a_member_logs_in__then_the_member_is_returned() {
 
  const memberShipManager =  Membership.newModelFactory().membershipManager();
  const memberResponse  = memberShipManager.loginMember(emailAddress);
  assert( 'Member should be found', true, (memberResponse && memberResponse.success));
  const member = memberResponse.data; 
  assert( 'Member email  should match', emailAddress, member.emailAddress );
}