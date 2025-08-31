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
const existingEmailAddress = 'christopher.smith@oopscope.com'; 

const testMemberMinimum = {
  emailAddress: testEmailAddress, 
  firstName: 'Testy', 
  lastName: 'User',
  phoneNumber: '123-456-7890',
  address: '123 Mock St, Faketown',
  interests: ['Woodworking, Quilting'],
  emailAddress: 'testUser@keoweekrafters.org'
};

const testMember = {
  ...testMemberMinimum,
  login: {status: 'UNVERIFIED'},
  registration: {status: 'NEW', level: 'Active'}
};

// Use ModelFactory to get a MembershipManager instance
const membershipManager = modelFactory.membershipManager();

function deleteTestMember() {
  const member = membershipManager.memberLookup(testMember.emailAddress);
  if (member && member.id) {
    // Assuming storageManager has a delete method by id
    membershipManager.storageManager.delete(member.id);
    Logger.log(`Deleted test member: ${emailAddress}`);
  }

}

function test_if_member_registers__then_member_data_is_complete() {
  try {
    const registeredMember = testMemberMinimum;
    registeredMember.registration = ZohoRegistration.createNew({level: 'Active'}); 
    membershipManager.addMemberRegistration(registeredMember);
    const member = membershipManager.memberLookup(testMember.emailAddress);
    assert('Email', testMember.emailAddress, member.emailAddress);
    assert('First Name', testMember.firstName, member.firstName);
    assert('Last Name', testMember.lastName, member.lastName);
    assert('Phone Number', testMember.phoneNumber, member.phoneNumber);
    assert('Address', testMember.address, member.address);
    assert('Crafts/Interests', testMember.interests, member.interests);
    assert('Membership Level', testMember.level, member.level);
    Logger.log('All fields verified successfully');
  } catch (err) {
    Logger.log('addMemberRegistration failed: ' + err);
  } finally {
    //deleteTestMember(testMember.emailAddress);
  }
}

function test_if_system_sends_email_then_user_receives_email() {
  membershipManager.sendEmail(testEmailAddress, 'Test', 'Just Testing');
}

function test_if_member_is_added_member_is_found() {
  try {
    membershipManager.addMember(testMemberMinimum);
    const member = membershipManager.memberLookup(testMemberMinimum.emailAddress);
    assert("Record", true, !!member);
    assert('Email', testMemberMinimum.emailAddress, member.emailAddress);
    Logger.log('All fields verified successfully');
    membershipManager.delete(member); 
  } catch (err) {
    Logger.log('addMember failed: ' + err);
  } finally {
    //deleteTestMember(testMemberMinimum.emailAddress);
  }
}

function test_if_duplicate_member_is_not_added() {
  membershipManager.addMember(testMemberMinimum); // First insert
  const firstMember = membershipManager.memberLookup(testMemberMinimum.emailAddress);
  const originalId = firstMember.id;

  membershipManager.addMember(testMemberMinimum); // Try again
  const secondMember = membershipManager.memberLookup(testMemberMinimum.emailAddress);
  assert('Duplicate id check', originalId, secondMember.id);

  //deleteTestMember(testMemberMinimum.emailAddress);
}

function test_if_status_and_memberStatus_are_set_correctly() {
  const member = new Member(testMember);
  membershipManager.addMember(member);

  let foundMember = membershipManager.memberLookup(member.emailAddress);
  assert('Initial status', 'UNVERIFIED', foundMember.login.status);

  membershipManager.setMemberStatus(foundMember.id, "VERIFIED"); 
  membershipManager.addMemberRegistration(member); // Should promote memberStatus to APPLIED if VERIFIED
  foundMember = membershipManager.memberLookup(member.emailAddress);
  assert('Member status', 'APPLIED', foundMember.registration.status);

  // deleteTestMember(member.emailAddress);
}

function test_if_registration_form_ignores_missing_fields() {
  const partial = new Member({
    emailAddress: 'partial@example.com',
    firstName: 'Partial'
  });

  try {
    membershipManager.addMemberRegistration(partial);
    const member = membershipManager.memberLookup(partial.emailAddress);
    assert('First Name', 'Partial', member.firstName);
    Logger.log('Missing fields handled gracefully');
  } catch (err) {
    Logger.log('Partial form test failed: ' + err);
  } finally {
   // deleteTestMember(partial.emailAddress);
  }
}

function test_when_user_logs_in__then_user_status_is_VERIFYING() {
  const emailAddress = testMember.emailAddress; 
  membershipManager.memberLogout(emailAddress); 
  let result = membershipManager.loginMember(emailAddress); 
  assert("Success", true, result.success); 
  assert("Status", "VERIFYING", result.data.login.status); 
} 

function test_when_existing_user_logs_in__then_user_status_is_VERIFYING() {
  const emailAddress = existingEmailAddress; 
  membershipManager.memberLogout(emailAddress); 
  let result = membershipManager.loginMember(emailAddress); 
  assert("Success", true, result.success); 
  assert("Status", "VERIFYING", result.data.login.status); 
} 

function test_verifyToken_transitions_user_to_VERIFIED() {
  const emailAddress = testMember.emailAddress;
  let member = membershipManager.memberLookup(emailAddress); 
  member.login.status='VERIFYING'; 
  const response = membershipManager.updateMember(member); 
  member = response.data; 
  assert("Status", "VERIFYING", member.login.status); 
  member = membershipManager.memberLookup(emailAddress); 
  const authentication = member.login.authentication;
  const token = authentication.token;
  result = membershipManager.verifyMemberToken(emailAddress, token);


  assert('Verification success', true, result.success);
  const savedMember = result.data; 
  const newAuthentication = savedMember.login.authentication;
  assert('Status updated to VERIFIED', 'VERIFIED', result.data.login.status);
  assertNotEqual('Expiration Changed', authentication.expirationTime, newAuthentication.expirationTime ); 
}

function test_getAllMembers_returns_members() {
  //membershipManager.addMemberRegistration(Member.fromObject(testMember));
  const allResponse = membershipManager.getAllMembers();
  const all = allResponse.data; 
  assert("Found Members", true, all.length> 0)
  //deleteTestMember(testMember.emailAddress);
}

function test_getAllMembers_by_page_returns_members() {
  let allResponse = membershipManager.getAllMembers({page:1});
  const page1 = allResponse.data; 
  const member1 = page1[0];
  const page2 = membershipManager.getAllMembers({page:2}).data; 
  const member2 = page2[0]; 
  assert('Found different members', true, member1.emailAddress != member2.emailAddress);
  //deleteTestMember(testMember.emailAddress);
}
function test_whenAuthenticationIsRequested_thenAuthenticationIsVerified() {
  membershipManager.addMemberRegistration(Member.fromObject(testMember));
  const member = membershipManager.memberLookup(testMember.emailAddress); 
  const authenticationIn = membershipManager.generateAuthentication(); 
  member.authentication = JSON.stringify(authenticationIn);
  membershipManager.updateMember(member);
  const authenticationOut = membershipManager.getAuthentication(testMember.emailAddress); 

  assert('Authentication Null', false, !authenticationOut); 
  assert('Token', authenticationIn.token, authenticationOut.token);
}

function test_whenMemberIsUpdated_thenMemberData_is_changed () {
  const originalMember = membershipManager.memberLookup(testMember.emailAddress); 
  const memberChanges = new ZohoMember({id: originalMember.id, name: originalMember.name, registration: originalMember.registration}); 

  memberChanges.registration.waiverSigned = originalMember.registration.waiverSigned===true?false:true; 
  memberChanges.phoneNumber = originalMember.phoneNumber.split('').reverse().join(''); 
 
  memberChanges.registration.status = originalMember.registration.status==='NEW'?'REGISTERED':'NEW';
  memberChanges.registration.level = originalMember.registration.level === 'Interested Party' ? 'Active' : 'Interested Party'; 
  const updatedMember = membershipManager.updateMember(memberChanges); 

  assert('Phone number changed', memberChanges.phoneNumber, updatedMember.phoneNumber );
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

function test_getInstructors_returns_instructors() {
  const instructors = membershipManager.getInstructors();
  Logger.log('Instructors:', instructors);
  // Check that instructors is an array and not empty
  assert('Instructors is array', true, Array.isArray(instructors));
  assert('At least one instructor found', true, instructors.length > 0);
  // Optionally, check that each instructor has expected properties
  instructors.forEach((inst, idx) => {
    assert(`Instructor ${idx} has level`, true, typeof inst.registration.level !== 'undefined');
    assert(`Instructor ${idx} has emailAddress`, true, typeof inst.emailAddress !== 'undefined');
  });
}

// Add to runAllTests
function runAllTests() {
  test_if_member_registers__then_member_data_is_complete();
  test_if_system_sends_email_then_user_receives_email();
  test_if_member_is_added_member_is_found();
  test_if_duplicate_member_is_not_added();
  //test_if_status_and_memberStatus_are_set_correctly();
  test_if_registration_form_ignores_missing_fields();
  test_when_user_logs_in__then_user_status_is_VERIFYING();
  test_verifyToken_transitions_user_to_VERIFIED();
  test_getAllMembers_returns_members();
  test_whenAuthenticationIsRequested_thenAuthenticationIsVerified();
  test_whenMemberIsUpdated_thenMemberData_is_changed();
  test_whenMemberIsCreatedFromData_thenAllFieldsAreThere();
  test_getInstructors_returns_instructors(); // <-- Add this line
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

  static fromRecord(row) {
    return new TestData(
      {...row}
    );
  }

  toRecord() {
    return {
      ...this
  };
  }
}
function test_StorageManager_add() {
  const storageManager = new SheetStorageManager('tests');
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
  const storageManager = new SheetStorageManager('tests');
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
function test_EventManagerGetsFilteredEvents() {
  
  const eventManager = new EventManager(); 
  const events = eventManager.getUpcomingEvents() ;
  assert('Events are there', events.length > 1 ,true); 
}

function test_when_get_config__then_key_parameters_are_set() {
  const configMerged = getConfig(); 
  assert("Config contains base URL: ", true, configMerged.baseUrl != undefined); 
  assert("Config point to correct URL", configMerged.mode==='dev'?config.dev.baseUrl:config.prod.baseUrl, configMerged.baseUrl); 
}