// Membership.gs — Core membership logic shared by web app and form triggers

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

function loginMember(email) {
  const lookup = memberLookup(email);
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + SharedConfig.loginTokenExpirationMinutes * 60 * 1000).toISOString();
  const tokenEntry = `${token}|${expirationTime}`;

  if (lookup.found && lookup.token) {
    const [_, expiry] = lookup.token.split('|');
    const expired = new Date() > new Date(expiry);

    if (expired) {
      setRecordStatus(lookup, 'TOKEN_EXPIRED');
      setRecordValue(lookup, 'authentication', tokenEntry);
      sendEmail(email, 'Your MakeKeowee Login Code', `Your verification code is: ${token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`);
    } else if (lookup.memberStatus === 'REGISTERED') {
      setRecordStatus(lookup, 'VERIFIED');
    }
  } else {
    appendNewMemberRecord({
      emailAddress: email,
      authentication: tokenEntry,
      memberStatus: 'VERIFYING'
    });
    sendEmail(email, 'Your MakeKeowee Login Code', `Your verification code is: ${token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`);
  }

  return {
    success: true,
    found: lookup.found,
    email,
    firstName: lookup.firstName || '',
    lastName: lookup.lastName || '',
    status: lookup.status || 'VERIFYING',
    memberStatus: lookup.memberStatus || 'NEW',
    redirectToForm: false,
    formUrl: null,
    entryMap: null
  };
}

function verifyMemberToken(email, userToken) {
  const lookup = memberLookup(email);
  if (!lookup.found || !lookup.token) {
    return {
      success: false,
      status: 'UNVERIFIED',
      message: 'Verification required. Please request a code.'
    };
  }

  const [storedToken, expiry] = lookup.token.split('|');
  if (new Date() > new Date(expiry)) {
    return {
      success: false,
      status: lookup.status,
      message: 'Token expired. Please request a new one.'
    };
  }

  if (userToken !== storedToken) {
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

  return {
    success: true,
    found: lookup.found,
    firstName: lookup.firstName,
    lastName: lookup.lastName,
    email,
    memberStatus: lookup.memberStatus,
    status: lookup.status,
    redirectToForm: false
  };
}

/**
 * Looks up a member by email in the registry sheet.
 */
function memberLookup(email) {
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
    rowIndex: row, 
    sheet: sheet, 
    found: true, 
    columnIndexByName: columnIndexByName
  }

  setSheetValue(lookup, SharedConfig.registry.sheet.emailLookupColumn, emailAddress);
  
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
      setSheetValue(lookup, key,value);
    }
  }
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

function sendEmail(email, title, message) {
  console.info(`Sending token to: ${email}`);
  GmailApp.sendEmail(email, title,
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

// Membership.gs — Core membership logic shared by web app and form triggers

function getAuthentication(emailAddress) {
  const lookup = memberLookup(emailAddress);
  if (!lookup.found) return null;
  return lookup.authentication || null;
}
