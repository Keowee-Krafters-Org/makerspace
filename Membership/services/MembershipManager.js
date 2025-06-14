// Membership.gs — Core membership logic shared by web app and form triggers
// Uses Member, Login, and Registration classes

class MembershipManager {
  /**
   * @param {StorageManager} storageManager - An instance of a storage manager (e.g., SheetStorageManager)
   */
  constructor(storageManager) {
    this.storage = storageManager;
  }

  getAllMembers() {
    return this.storage.getAll().map(member => member.toObject());
  }

  updateMember(memberData) {
    const member = Member.fromObject(memberData);
    const found = this.storage.getByKeyValue('emailAddress', member.emailAddress)[0];
    if (!found) throw new Error(`Member not found: ${member.emailAddress}`);
    try {
      this.storage.update(found.id, member);
      return member;
    } catch (error) {
      console.error(`Failed to update member record for ${member.emailAddress}: ${error.message}`);
      return false;
    }
  }

  loginMember(emailAddress) {
    let member = this.storage.getByKeyValue('emailAddress', emailAddress)[0];
    let expired = true;
    const authentication = this.generateAuthentication();
    const authenticationEntry = JSON.stringify(authentication);

    if (!member) {
      this.addMember({ emailAddress });
      member = this.storage.getByKeyValue('emailAddress', emailAddress)[0];
      member.authentication = authenticationEntry;
      member.memberStatus = "VERIFYING";
      this.storage.update(member.id, member);
    } else {
      member.authentication = authenticationEntry;
      member.memberStatus = "VERIFYING";
      this.storage.update(member.id, member);
    }

    if (member.login && member.login.authentication) {
      const expirationTime = member.login.authentication.expirationTime;
      expired = new Date() > new Date(expirationTime);
    }

    if (!expired && member.registration && member.registration.status === 'REGISTERED') {
      member.memberStatus = 'VERIFIED';
      this.storage.update(member.id, member);
    }

    if (member.login && member.login.status === 'VERIFYING') {
      this.sendEmail(emailAddress, 'Your MakeKeowee Login Code', `Your verification code is: ${authentication.token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`);
    }

    return new Response(true, member);
  }

  generateAuthentication(durationMinutes = SharedConfig.loginTokenExpirationMinutes) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    return { token, expirationTime };
  }

  verifyMemberToken(emailAddress, userToken) {
    const member = this.storage.getByKeyValue('emailAddress', emailAddress)[0];
    if (!member) {
      return { success: false, status: 'UNVERIFIED', message: 'Email record not found - please login again to correct' };
    }

    if (!member.login || !member.login.authentication) {
      member.memberStatus = 'UNVERIFIED';
      this.storage.update(member.id, member);
      return { success: false, status: 'UNVERIFIED', message: 'Verification required. Please request a code.' };
    }

    const authentication = member.login.authentication;
    const expirationTime = authentication.expirationTime;
    if (new Date() > new Date(expirationTime)) {
      return new Response(false, member.toObject(), 'Token expired. Please request a new one.');
    }

    if (userToken !== authentication.token) {
      return { success: false, status: member.login.status, message: 'Invalid token. Please check and try again.' };
    }

    if (member.login.status === 'VERIFYING' || member.login.status === 'TOKEN_EXPIRED') {
      member.memberStatus = 'VERIFIED';
      // Extend token expiration to 4 hours
      const newAuth = this.generateAuthentication(240);
      newAuth.token = authentication.token;
      member.authentication = JSON.stringify(newAuth);
      this.storage.update(member.id, member);
    }

    if (member.login.status === 'REMOVE') {
      return new Response(false, member.toObject(), 'Access denied. Please contact administrator.');
    }

    return new Response(true, member.toObject());
  }

  memberLookup(emailAddress) {
    const response = this.storage.getByKeyValue('emailAddress', emailAddress);
    if (response.length === 0) return null;

    const member = response.data[0];
    if (!member) return null;
    return member;
  }

  addMember(memberData) {
    let member = this.memberLookup(memberData.emailAddress);
    if (member) return member;
    member = this.storage.addMemberWithEmail(memberData.emailAddress);
    member.status = 'UNVERIFIED';
    member.timestamp = new Date();
    this.storage.update(member.id, member);
    return member;
  }

  addMemberRegistration(memberData) {
    if (!memberData.emailAddress) return;
    let member = this.storage.getByKeyValue('emailAddress', memberData.emailAddress)[0];
    if (member && member.login.status === 'VERIFIED') {
      member.login.status = 'APPLIED';
    }
    Object.assign(member, memberData);
    this.storage.update(member.id, member);
    return member.id;
  }

  setMemberStatus(id, status) {
    const member = this.storage.getById(id);
    if (member) {
      member.status = status;
      this.storage.update(id, member);
    }
  }

  sendEmail(emailAddress, title, message) {
    console.info(`Sending token to: ${emailAddress}`);
    GmailApp.sendEmail(emailAddress, title, message, {
      from: 'noreply@keoweekrafters.org',
      name: 'KeoweeKrafters',
      noReply: true
    });
  }

  memberLogout(emailAddress) {
    const member = this.storage.getByKeyValue('emailAddress', emailAddress)[0];
    if (!member) return { success: false, status: 'NOT_FOUND' };
    member.status = 'UNVERIFIED';
    this.storage.update(member.id, member);
    SpreadsheetApp.flush();
    return { success: true, status: 'UNVERIFIED' };
  }

  getAuthentication(emailAddress) {
    const member = this.storage.getByKeyValue('email_address', emailAddress)[0];
    if (!member) return null;
    return member.login.authentication || null;
  }
}