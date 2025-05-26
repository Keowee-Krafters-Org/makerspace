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

const testEmailAddress = 'testuser@keoweekrafters.org'; 

// Replace raw objects with instances of Member class
const testMemberMinimum = new Member({
  emailAddress: testEmailAddress
});

const testMember = new Member({
  emailAddress: testEmailAddress,
  firstName: 'Testy',
  lastName: 'User',
  phoneNumber: '123-456-7890',
  address: '123 Mock St, Faketown',
  interests: 'Woodworking, Quilting',
  level: 1
});

function deleteTestMember(emailAddress) {
  const sheet = getRegistrySheet();
  const data = sheet.getDataRange().getValues();
  const columnIndexByName = getNamedColumnIndexMap(); 

  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndexByName['emailAddress']] === emailAddress) {
      sheet.deleteRow(i + 1);
      Logger.log(`Deleted test member: ${emailAddress}`);
      return;
    }
  }
  SpreadsheetApp.flush();
}

function test_if_member_registers__then_member_data_is_complete() {
  try {
    addMemberRegistration(testMember.toObject());
    const lookup = memberLookup(testMember.emailAddress);
    const sheet = lookup.sheet;
    const row = lookup.rowIndex;
    const cols = lookup.columnIndexByName;

    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    assert('Email', testMember.emailAddress, values[cols['emailAddress']-1]);
    assert('First Name', testMember.firstName, values[cols['firstName']-1]);
    assert('Last Name', testMember.lastName, values[cols['lastName']-1]);
    assert('Phone Number', testMember.phoneNumber, values[cols['phoneNumber']-1]);
    assert('Address', testMember.address, values[cols['address']-1]);
    assert('Crafts/Interests', testMember.interests, values[cols['interests']-1]);
    assert('Membership Level', testMember.level, values[cols['level']-1]);

    Logger.log('All fields verified successfully');
  } catch (err) {
    Logger.log('addMemberRegistration failed: ' + err);
  } finally {
    deleteTestMember(testMember.emailAddress);
  }
}

function test_if_system_sends_email_then_user_receives_email() {
  sendEmail(testEmailAddress, 'Test', 'Just Testing');
}

function test_if_member_is_added_member_is_found() {
  try {
    addMember(testMemberMinimum.toObject());
    const lookup = memberLookup(testMemberMinimum.emailAddress);
    assert("Record", true, lookup.found);
    const sheet = lookup.sheet;
    const row = lookup.rowIndex;
    const cols = lookup.columnIndexByName; 
    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    assert('Email', testMemberMinimum.emailAddress, values[cols['emailAddress']-1]);
    Logger.log('All fields verified successfully');
  } catch (err) {
    Logger.log('addMember failed: ' + err);
  } finally {
    deleteTestMember(testMemberMinimum.emailAddress);
  }
}

function test_if_duplicate_member_is_not_added() {
  addMember(testMemberMinimum.toObject()); // First insert
  const firstLookup = memberLookup(testMemberMinimum.emailAddress);
  const originalRow = firstLookup.rowIndex;

  addMember(testMemberMinimum.toObject()); // Try again
  const secondLookup = memberLookup(testMemberMinimum.emailAddress);
  assert('Duplicate row check', originalRow, secondLookup.rowIndex);

  deleteTestMember(testMemberMinimum.emailAddress);
}

function test_if_status_and_memberStatus_are_set_correctly() {
  const member = new Member(testMember.toObject());
  addMember(member.toObject());

  let lookup = memberLookup(member.emailAddress);
  assert('Initial status', 'UNVERIFIED', lookup.member.login.status);

  setRecordStatus(lookup, "VERIFIED"); 
  addMemberRegistration(member.toObject()); // Should promote memberStatus to APPLIED if VERIFIED
  lookup = memberLookup(member.emailAddress);
  assert('Member status', 'APPLIED', lookup.member.registration.status);

  deleteTestMember(member.emailAddress);
}

function test_if_registration_form_ignores_missing_fields() {
  const partial = new Member({
    emailAddress: 'partial@example.com',
    firstName: 'Partial'
  });

  try {
    addMemberRegistration(partial.toObject());
    const lookup = memberLookup(partial.emailAddress);
    assert('First Name', 'Partial', lookup.firstName);
    Logger.log('Missing fields handled gracefully');
  } catch (err) {
    Logger.log('Partial form test failed: ' + err);
  } finally {
    deleteTestMember(partial.emailAddress);
  }
}

/**
 * When user has entered emailAddress and logged in
 * And user status is UNVERIFIED
 * Then token is generated and sent
 * And user status is updated to VERIFYING
 */
function test_when_user_logs_in__then_user_status_is_VERIFYING() {
  const emailAddress = testMember.emailAddress; 
  // Given user has entered emailAddress and logged in
  let result = loginMember(emailAddress); 
  assert("Success", true, result.success); 
  
  //And user status is VERIFYING
  assert("Status", "VERIFYING", result.data.login.status); 
} 

/**
 * Given user has entered emailAddress and logged in
 * And user status is VERIFYING
 * And token was sent to user emailAddress
 * When user enters correct token
 * Then user status is updated to VERIFIED
 */
function test_verifyToken_transitions_user_to_VERIFIED() {
  const emailAddress = testMember.emailAddress; 
  let result = loginMember(emailAddress); 
  
  assert("Status", "VERIFYING", result.data.login.status); 
  const lookup  = memberLookup(emailAddress); 
  const token = getRecordAuthentication(lookup, 'authentication').token;
  result = verifyMemberToken(emailAddress, token);

  assert('Verification success', true, result.success);
  assert('Status updated to VERIFIED', 'VERIFIED', result.data.login.status);
}

/**
 * Test that getAllMembers() returns the correct structure
 */
function test_getAllMembers_returns_members() {
  addMemberRegistration(testMember.toObject());
  const all = getAllMembers();
  const found = all.find(m => m.emailAddress === testMember.emailAddress);
  assert('Found registered member', true, !!found);
  assert('First name matches', testMember.firstName, found.firstName);
  deleteTestMember(testMember.emailAddress);
}


function test_whenAuthenticationIsRequested_thenAuthenticationIsVerified() {
  let lookup = addMemberRegistration(testMember.toObject());
  lookup = memberLookup(testMember.emailAddress); 
  const authenticationIn = generateAuthentication(); 
  setRecordValue(lookup, 'authentication', JSON.stringify(authenticationIn));
  SpreadsheetApp.flush(); 
  const authenticationOut = getAuthentication(testMember.emailAddress); 


  assert('Authentication Null', false, !authenticationOut); 
  assert('Token', authenticationIn.token, authenticationOut.token);
}


