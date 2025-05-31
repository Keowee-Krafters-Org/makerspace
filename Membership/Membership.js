// Membership.gs — Core membership logic shared by web app and form triggers
// Uses Member, Login, and Registration classes

function getAllMembers() {
  const sheet = getRegistrySheet();
  const data = sheet.getDataRange().getValues();
  const colMap = getNamedColumnIndexMap(sheet);
  return data.slice(1).map(row => Member.fromRow(objectFromRow(row, colMap)).toObject());
}

/** Create a data object (key/value pair) from the data array using the name to column index map */
function objectFromRow(row, colMap) {
  const dataObject = {};
  for (const [key, colIndex] of Object.entries(colMap)) {
    dataObject[key] = row[colIndex - 1]; // Convert 1-based index to 0-based
  }
  return dataObject;
}

function updateMember(memberData) {
  const member=Member.fromObject(memberData);
  const  emailAddress =  member.emailAddress; 
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) {
    throw new Error(`Member not found: ${emailAddress}`);
  }

  try {
    return updateMemberRecord(lookup, member).member;
  } catch (error) {
    console.error(`Failed to update member record for ${emailAddress}: ${error.message}`);
    return false; // Or handle error accordingly
  }

}

function loginMember(emailAddress) {
  let lookup = memberLookup(emailAddress);
  let expired = true;
  const authentication = generateAuthentication();
  const authenticationEntry = JSON.stringify(authentication);
  if (!lookup.found) {
    appendNewMemberRecord({
      emailAddress: emailAddress,
      authentication: authenticationEntry,
      memberStatus: "VERIFYING"
    });
    SpreadsheetApp.flush();
    lookup = memberLookup(emailAddress);
  }
  setRecordStatus(lookup, 'VERIFYING');
  if (lookup.authentication) {
    const expirationTime = lookup.authentication.expirationTime;
    expired = new Date() > new Date(expirationTime);
  }

  if (!expired && lookup.member.registration.status === 'REGISTERED') {
    setRecordStatus(lookup, 'VERIFIED');
  }

  setSheetValue(lookup, 'authentication', authenticationEntry);
  SpreadsheetApp.flush();
  // Still in verification mode?
  if (lookup.member.login.status === 'VERIFYING') {
    sendEmail(emailAddress, 'Your MakeKeowee Login Code', `Your verification code is: ${authentication.token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`);
  }

  return new Response(true, lookup.member);
}

function generateAuthentication(durationMinutes = SharedConfig.loginTokenExpirationMinutes) {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  return { token, expirationTime };
}

/**
 * Verify the token against the stored token and 
 */

function verifyMemberToken(emailAddress, userToken) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) {
    return { success: false, status: 'UNVERIFIED', message: 'Email record not found - please login again to correct' };
  }

  if (!lookup.member.login.authentication) {
    setRecordStatus(lookup, 'UNVERIFIED');
    return { success: false, status: 'UNVERIFIED', message: 'Verification required. Please request a code.' };
  }

  const authentication = lookup.member.login.authentication;
  const expirationTime = authentication.expirationTime;
  if (new Date() > new Date(expirationTime)) {
    return new Response(false, lookup.member.toObject(), 'Token expired. Please request a new one.');
  }

  if (userToken !== authentication.token) {
    return { success: false, status: lookup.member.login.status, message: 'Invalid token. Please check and try again.' };
  }

  if (lookup.member.login.status === 'VERIFYING' || lookup.member.login.status === 'TOKEN_EXPIRED') {
    setRecordStatus(lookup, 'VERIFIED');

    // Extend token expiration to 4 hours
    const newAuth = generateAuthentication(240);
    newAuth.token = authentication.token;
    setSheetValue(lookup, 'authentication', JSON.stringify(newAuth));
    SpreadsheetApp.flush();
  }

  if (lookup.member.login.status === 'REMOVE') {
    return new Response(false, lookup.member.toObject(), 'Access denied. Please contact administrator.');
  }

  SpreadsheetApp.flush();
  return new Response(true, lookup.member.toObject());
}

/**
 * Looks up a member by emailAddress in the registry sheet.
 */
function memberLookup(emailAddress) {
  const sheet = SpreadsheetApp.openById(SharedConfig.registry.sheet.id)
    .getSheetByName(SharedConfig.registry.sheet.name);
  const data = sheet.getDataRange().getValues();
  const columnIndexByName = getNamedColumnIndexMap(sheet);
  const emailCol = columnIndexByName['emailAddress']-1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol]?.toLowerCase() === emailAddress.toLowerCase()) {
      const rowObject = objectFromRow(data[i], columnIndexByName);
      const member = Member.fromRow(rowObject);
      return new Lookup(
        true, i + 1, columnIndexByName, sheet, member);
      }
    }
  return new Lookup(false, 0, columnIndexByName, sheet);
}

function addMember(member) {
  const lookup = memberLookup(member.emailAddress);
  if (lookup.found) return lookup;

  const newLookup = addMemberWithEmail(member.emailAddress);

  updateMemberRecord(newLookup, {
    emailAddress: member.emailAddress,
    status: 'UNVERIFIED',
    timestamp: new Date()
  });

  return newLookup;
}

function addMemberWithEmail(emailAddress) {
  const columnIndexByName = getNamedColumnIndexMap();
  const sheet = getRegistrySheet();
  sheet.appendRow(new Array(sheet.getLastColumn()).fill(''));
  SpreadsheetApp.flush();
  const row = sheet.getLastRow();
  const lookup = new Lookup(true, 
    row + 1,
    columnIndexByName,
    sheet, 
    Member.fromObject({ timestamp: new Date(), emailAddress: emailAddress })
  ); 
  updateMemberRecord(lookup, lookup.member); 
  return lookup;
}

function addMemberRegistration(member) {
  if (!member.emailAddress) return;

  const lookup = memberLookup(member.emailAddress);
  if (lookup.member.login.status === 'VERIFIED') {
    lookup.member.login.status =  'APPLIED';
  }

  updateMemberRecord(lookup, member);
  return lookup.rowIndex;
}

/**
 * Updates fields in a member record row using named range mapping.
 */
function updateMemberRecord(lookup, memberOrData) {
  const sheet = lookup.sheet;
  const columnIndexByName = lookup.columnIndexByName;
  const row = lookup.rowIndex;

  const data = memberOrData.toRow ? memberOrData.toRow() : Member.fromObject(memberOrData);

  for (const [key, value] of Object.entries(data)) {
    if (columnIndexByName[key] !== undefined && value !== undefined) {
      setSheetValue(lookup, key, value);
    }
  }

  SpreadsheetApp.flush();
  return memberLookup(lookup.member.emailAddress);
}

/**
 * Appends a new blank row to the registry sheet, and relies on updateMemberRecord for population.
 */
function appendNewMemberRecord(data) {
  const lookup = addMemberWithEmail(data.emailAddress);
  updateMemberRecord(lookup, data);
}

function setSheetValue(lookup, column, value) {
  const columnIndexByName = lookup.columnIndexByName;
  if (columnIndexByName[column] === undefined) {
    console.warn(`Unknown column name: ${column}`);
    return;
  }
  const row = lookup.rowIndex;
  const sheet = lookup.sheet;
  sheet.getRange(row, columnIndexByName[column]).setValue(value);
}

function setRecordStatus(lookup, status) {
  setSheetValue(lookup, 'status', status);
  lookup.member.login.status = status;
  return lookup;
}

function setRecordValue(lookup, column, value) {
  setSheetValue(lookup, column, value);
  return lookup;
}

function setMemberStatus(lookup, status) {
  return setRecordValue(lookup, 'memberStatus', status);
}

function addMemberWithStatus(member, status) {
  const lookup = addMember(member);
  return setMemberStatus(lookup, status);
}

function getSharedConfig() {
  return SharedConfig;
}

function sendEmail(emailAddress, title, message) {
  console.info(`Sending token to: ${emailAddress}`);
  GmailApp.sendEmail(emailAddress, title,
    message,
    {
      from: 'noreply@keoweekrafters.org',
      name: 'KeoweeKrafters',
      noReply: true
    });
}

function getRegistrySheet() {
  return SpreadsheetApp
    .openById(SharedConfig.registry.sheet.id)
    .getSheetByName(SharedConfig.registry.sheet.name);
}

function getNamedColumnIndexMap(sheet = getRegistrySheet()) {
  const ranges = SpreadsheetApp.openById(SharedConfig.registry.sheet.id).getNamedRanges();
  const map = {};
  const sheetId = sheet.getSheetId();

  ranges.forEach(r => {
    const range = r.getRange();
    if (range.getSheet().getSheetId() === sheetId && range.getNumColumns() === 1) {
      map[r.getName()] = range.getColumn();
    }
  });
  return map;
}

/**
 * Get the value in the record for column
 * @returns the value of the row and column
 */
function getRecordValue(lookup, column) {
  const sheet = lookup.sheet;
  const row = lookup.rowIndex;
  const columnIndexByName = lookup.columnIndexByName;
  return sheet.getRange(row, columnIndexByName[column]).getValue();
}

function getRecordAuthentication(lookup) {
  const authenticationEntry = getRecordValue(lookup, 'authentication');
  return parseAuthenticationEntry(authenticationEntry);
}

function parseAuthenticationEntry(authenticationEntry) {
  return (authenticationEntry && authenticationEntry != '') ?
    JSON.parse(authenticationEntry) :
    generateAuthentication();
}

function memberLogout(emailAddress) {
  const lookup = memberLookup(emailAddress); 
  setRecordStatus(lookup, 'UNVERIFIED'); 
  SpreadsheetApp.flush(); 
  return { success: true, status: 'UNVERIFIED' }; 
}

function getAuthentication(emailAddress) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) return null;
  return lookup.member.login.authentication || null;
}