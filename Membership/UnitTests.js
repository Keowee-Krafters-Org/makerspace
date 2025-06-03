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
 * Assert block for tests
 */
const assertNotEqual = (label, expected, actual) => {
  if (expected === actual) {
    throw new Error(`${label} mismatch. Expected: ${actual} != ${expected} `);
  } else {
    Logger.log(`${label} verified : ${actual} != ${expected}`);
  }
};
const testEmailAddress = 'testuser@keoweekrafters.org'; 


const testMemberMinimum = {
  emailAddress: testEmailAddress
};

const testMember = {
  emailAddress: testEmailAddress,
  firstName: 'Testy',
  lastName: 'User',
  phoneNumber: '123-456-7890',
  address: '123 Mock St, Faketown',
  interests: 'Woodworking, Quilting',
  level: 1,
  status: 'UNVERIFIED',
  memberStatus: 'NEW'
};

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
    addMemberRegistration(Member.fromObject(testMember));
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
    Logger.error('addMemberRegistration failed: ' + err);
  } finally {
    deleteTestMember(testMember.emailAddress);
  }
}

function test_if_system_sends_email_then_user_receives_email() {
  sendEmail(testEmailAddress, 'Test', 'Just Testing');
}

function test_if_member_is_added_member_is_found() {
  try {
    addMember(testMemberMinimum);
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
  const member = new Member(testMember);
  addMember(member);

  let lookup = memberLookup(member.emailAddress);
  assert('Initial status', 'UNVERIFIED', lookup.member.login.status);

  setRecordStatus(lookup, "VERIFIED"); 
  addMemberRegistration(member); // Should promote memberStatus to APPLIED if VERIFIED
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
    addMemberRegistration(partial);
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
  const authentication = getRecordAuthentication(lookup);
  const token = authentication.token;
  result = verifyMemberToken(emailAddress, token);

  const newAuthentication = getRecordAuthentication(lookup);

  assert('Verification success', true, result.success);
  assert('Status updated to VERIFIED', 'VERIFIED', result.data.login.status);
  assertNotEqual('Expiration Changed', authentication.expirationTime, newAuthentication.expirationTime ); 
}

/**
 * Test that getAllMembers() returns the correct structure
 */
function test_getAllMembers_returns_members() {
  addMemberRegistration(Member.fromObject(testMember));
  const all = getAllMembers();
  const found = all.find(m => m.emailAddress === testMember.emailAddress);
  assert('Found registered member', true, !!found);
  assert('First name matches', testMember.firstName, found.firstName);
  deleteTestMember(testMember.emailAddress);
}


function test_whenAuthenticationIsRequested_thenAuthenticationIsVerified() {
  let lookup = addMemberRegistration(Member.fromObject(testMember));
  lookup = memberLookup(testMember.emailAddress); 
  const authenticationIn = generateAuthentication(); 
  setRecordValue(lookup, 'authentication', JSON.stringify(authenticationIn));
  SpreadsheetApp.flush(); 
  const authenticationOut = getAuthentication(testMember.emailAddress); 


  assert('Authentication Null', false, !authenticationOut); 
  assert('Token', authenticationIn.token, authenticationOut.token);
}


function test_whenMemberIsUpdated_thenMemberData_is_changed () {
  const originalMember = memberLookup(testMember.emailAddress).member; 
  const memberChanges =  memberLookup(testMember.emailAddress).member; 
  memberChanges.registration.waiverSigned = !originalMember.registration.waiverSigned; 
  memberChanges.phoneNumber = originalMember.phoneNumber.split('').reverse().join(''); 
  memberChanges.registration.status = originalMember.registration.status.split('').reverse().join('');
  memberChanges.registration.level = originalMember.registration === 2?1:2; 
  const updatedMember=updateMember(memberChanges); 

  assert('Phone number changed', memberChanges.phoneNumber,updatedMember.phoneNumber )
  assert("Waiver Changed", memberChanges.registration.waiverSigned, updatedMember.registration.waiverSigned); 
  assert("Registration Status Changed", memberChanges.registration.status, updatedMember.registration.status); 
  assert("Registration level", memberChanges.registration.level, updatedMember.registration.level); 

}

function test_whenMemberIsCreatedFromData_thenAllFieldsAreThere(){
    const newMember = Member.fromObject({
  ...testMember,
    registration: {status: testMember.memberStatus},
    login: {status: 'UNVERIFIED'}
  });

  assert('First Name', testMember.firstName, newMember.firstName); 

  assert('Registration Status', testMember.memberStatus, newMember.registration.status); 

  assert('Login Status', testMember.status, newMember.login.status); 


}

function runAllTests() {
  test_if_member_registers__then_member_data_is_complete();
  test_if_system_sends_email_then_user_receives_email();
  test_if_member_is_added_member_is_found();
  test_if_duplicate_member_is_not_added();
  test_if_status_and_memberStatus_are_set_correctly();
  test_if_registration_form_ignores_missing_fields();
  test_when_user_logs_in__then_user_status_is_VERIFYING();
  test_verifyToken_transitions_user_to_VERIFIED();
  test_getAllMembers_returns_members();
  test_whenAuthenticationIsRequested_thenAuthenticationIsVerified();
  test_whenMemberIsUpdated_thenMemberData_is_changed();
  test_whenMemberIsCreatedFromData_thenAllFieldsAreThere(); 
}
function runTests() {
  try {
    runAllTests();
    Logger.log('All tests passed successfully!');
  } catch (error) {
    Logger.error('Test failed: ' + error.message);
  }
}



class TestData {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.timestamp = data.timestamp;
    this.complete = data.complete;
  }

  static fromRow(row) {
    return new TestData(
      {...row}
    );
  }

  toRow() {
    return {
      ...this
  };
  }
}
function test_StorageManager_add() {
  const storageManager = new StorageManager('tests');
  // Ensure the sheet is empty before the test
  const sheet = storageManager.getSheet();

  const testData = new TestData({id:'1', title:'Test Title', timestamp:new Date(), complete:true});

  // Add record
  storageManager.add(testData);

  // Load data
  const loadedData = storageManager.getRecordById(TestData,testData.id);

  // Assertions
  assert('Record added and loaded correctly', JSON.stringify(testData), JSON.stringify(loadedData));
}

function test_StorageManager_getAll() {
  const storageManager = new StorageManager('tests');
  const sheet = storageManager.getSheet();
  
  // Clear the sheet before the test
  storageManager.clear();
  // Add test records
  const testData1 = new TestData({ id: '1', title: 'Test Title 1', timestamp: new Date(), complete: true });
  const testData2 = new TestData({ id: '2', title: 'Test Title 2', timestamp: new Date(), complete: false });

  storageManager.add(testData1);
  storageManager.add(testData2);

  // Retrieve all records
  const allRecords = storageManager.getAll(TestData);

  // Assertions
  assert('Correct number of records', 2, allRecords.length);
  assert('First record matches', JSON.stringify(testData1), JSON.stringify(allRecords[0]));
  assert('Second record matches', JSON.stringify(testData2), JSON.stringify(allRecords[1]));
}

function test_EventManagerGetsAllEvents() {
  const eventManager = new EventManager(); 
  const events = eventManager.getEventList() ;
  assert('Events are there', events.length > 0 ,true); 
  
}
