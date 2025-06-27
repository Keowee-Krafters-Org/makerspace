// Tests
const modelFactory = newModelFactory();
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


const TEST_EMAIL = 'testuser@keoweekrafters.org'; 
function test_when_user_logs_in__then_email_is_sent() {
  const membershipManager = Membership.modelFactory.newMembershipManager();
  const email=TEST_EMAIL;
  const response= login(email);
  console.log(response); 
}

function test_when_valied_token_is_verified__then_member_is_verified() {
  const userToken='728170'
  const email=TEST_EMAIL;
  const response = JSON.parse(verifyToken(email,userToken));
  console.log(response)
  assert("Status", 'VERIFIED',response.data.login.status)
}

function test_when_not_verified_user_is_sent_email() {

  lookup = Membership.memberLookup(TEST_EMAIL); 
  setRecordStatus(lookup, 'UNVERIFIED'); 
  const response= login(TEST_EMAIL);
  assert("Status", "VERIFYING", response.status); 
}

