// Membership.gs — Core membership logic shared by web app and form triggers
// Uses Member class

function getAllMembers() {
  const sheet = getRegistrySheet();
  const data = sheet.getDataRange().getValues();
  const colMap = getNamedColumnIndexMap(sheet);
  return data.slice(1).map(row => Member.fromRow(row, colMap).toObject());
}

function updateMember(emailAddress, updates) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) {
    throw new Error(`Member not found: ${emailAddress}`);
  }
  updateMemberRecord(lookup, updates);
  return true;
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

  if (!expired && lookup.memberStatus === 'REGISTERED') {
    setRecordStatus(lookup, 'VERIFIED');
  }

  setRecordValue(lookup, 'authentication', authenticationEntry);
  SpreadsheetApp.flush();
  // Still in verification mode? 
  if (lookup.status === 'VERIFYING') {
    sendEmail(emailAddress, 'Your MakeKeowee Login Code', `Your verification code is: ${authentication.token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`);
  }

  return {
    success: true,
    found: lookup.found,
    emailAddress: lookup.emailAddress,
    firstName: lookup.firstName || '',
    lastName: lookup.lastName || '',
    status: lookup.status || 'VERIFYING',
    memberStatus: lookup.memberStatus || 'NEW',
    redirectToForm: false,
    level: lookup.level,
    formUrl: null,
    entryMap: null
  };
}

function generateAuthentication() {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + SharedConfig.loginTokenExpirationMinutes * 60 * 1000).toISOString();
  const authentication = { token: token, expirationTime: expirationTime };
  return authentication;
}

function verifyMemberToken(emailAddress, userToken) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) {
    return {
      success: false,
      status: 'UNVERIFIED',
      message: 'Email record not found - please login again to correct'
    };
  }

  if (!lookup.authentication) {
    setRecordStatus(lookup, 'UNVERIFIED');
    return {
      success: false,
      status: 'UNVERIFIED',
      message: 'Verification required. Please request a code.'
    };
  }

  const expirationTime = lookup.authentication.expirationTime;
  if (new Date() > new Date(expirationTime)) {
    return {
      success: false,
      status: lookup.status,
      message: 'Token expired. Please request a new one.'
    };
  }

  if (userToken !== lookup.authentication.token) {
    return {
      success: false,
      status: lookup.status,
      message: 'Invalid token. Please check and try again.'
    };
  }

  if (lookup.status === 'VERIFYING' || lookup.status === 'TOKEN_EXPIRED') {
    setRecordStatus(lookup, 'VERIFIED');
  }

  if (lookup.status === 'REMOVE') {
    return {
      success: false,
      message: 'Access denied. Please contact administrator.'
    };
  }
  SpreadsheetApp.flush();
  return {
    success: true,
    emailAddress: emailAddress, 
    found: lookup.found,
    firstName: lookup.firstName,
    lastName: lookup.lastName,
    memberStatus: lookup.memberStatus,
    status: lookup.status,
    redirectToForm: false
  };
}

/**
 * Looks up a member by emailAddress in the registry sheet.
 */
function memberLookup(emailAddress) {
  const sheet = SpreadsheetApp.openById(SharedConfig.registry.sheet.id)
    .getSheetByName(SharedConfig.registry.sheet.name);
  const data = sheet.getDataRange().getValues();
  const columnIndexByName = getNamedColumnIndexMap(sheet);
  const emailCol = columnIndexByName['emailAddress'] - 1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol]?.toLowerCase() === email.toLowerCase()) {
      const member = Member.fromRow(data[i], columnIndexByName);
      return {
        found: true,
        ...member.toObject(),
        authentication: data[i][columnIndexByName['authentication'] - 1],
        rowIndex: i + 1,
        level: data[i][levelCol],
        sheet,
        columnIndexByName
      };
    }
  }
  return { found: false, sheet, columnIndexByName };
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
  const lookup = {
    rowIndex: row + 1,
    sheet: sheet,
    found: true,
    columnIndexByName: columnIndexByName
  }

  setSheetValue(lookup, SharedConfig.registry.sheet.emailLookupColumn, emailAddress);
  SpreadsheetApp.flush();
  return lookup;
}


function addMemberRegistration(member) {
  if (!member.emailAddress) return;

  const lookup = memberLookup(member.emailAddress);
  if (lookup.status === 'VERIFIED') {
    setRecordValue(lookup, 'memberStatus', 'APPLIED');
  }

  updateMemberRecord(lookup, member);
  return lookup.rowIndex;
}

/**
 * Updates fields in a member record row using named range mapping.
 */
function updateMemberRecord(lookup, values) {
  const sheet = lookup.sheet;
  const row = lookup.rowIndex;
  const columnIndexByName = lookup.columnIndexByName;

  for (const [key, value] of Object.entries(values)) {
    if (columnIndexByName[key] !== undefined && value !== undefined) {
      setSheetValue(lookup, key, value);
    }
  }
  SpreadsheetApp.flush();
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
  lookup.status = status;
  return lookup;
}

function setRecordValue(lookup, column, status) {
  setSheetValue(lookup, column, status);
  lookup[column] = status;
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
 * @returns the value of the rom and column
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
  return {success: true, status: 'UNVERIFIED'}; 
}
function getAuthentication(emailAddress) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) return null;
  return lookup.authentication || null;
}