// Membership.gs — Core membership logic shared by web app and form triggers
// Uses Member, Login, and Registration classes

class MembershipManager {
  /**
   * @param {StorageManager} storageManager - An instance of a storage manager (e.g., SheetStorageManager)
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  getAllMembers() {
    return this.storageManager.getAll().map(member => member.toObject());
  }

  updateMember(member) {

    if (!member) throw new Error(`Member not found: ${member.emailAddress}`);
    if (!member.id) throw new Error(`Member ID missing: ${member.emailAddress}`);
    if (!member.name) throw new Error(`Member name missing: ${member.name}`);
    try {
      this.storageManager.update(member.id, member);
      return member;
    } catch (error) {
      console.error(`Failed to update member record for ${member.emailAddress}: ${error.message}`);
      return false;
    }
  }

  loginMember(emailAddress) {
    let member = this.memberLookup(emailAddress);
    let expired = true;
    const authentication = this.generateAuthentication();
    const authenticationEntry = JSON.stringify(authentication);

    if (!member) {
      this.addMember({ emailAddress });
      member = this.memberLookup(emailAddress);
      member.authentication = authenticationEntry;
      member.registration.status = "VERIFYING";
      this.storageManager.update(member.id, member);
    } else {
      member.authentication = authenticationEntry;
      member.registration.status  = "VERIFYING";
      this.storageManager.update(member.id, member);
    }

    if (member.login && member.login.authentication) {
      const expirationTime = member.login.authentication.expirationTime;
      expired = new Date() > new Date(expirationTime);
    }

    if (!expired && member.registration && member.registration.status === 'REGISTERED') {
      member.registration.status = 'VERIFIED';
      this.storageManager.update(member.id, member);
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
    const member = this.memberLookup(emailAddress);
    if (!member) {
      return { success: false, status: 'UNVERIFIED', message: 'Email record not found - please login again to correct' };
    }

    if (!member.login || !member.login.authentication) {
      member.registration.status = 'UNVERIFIED';
      this.storageManager.update(member.id, member);
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
      member.registration.status = 'VERIFIED';
      // Extend token expiration to 4 hours
      const newAuth = this.generateAuthentication(240);
      newAuth.token = authentication.token;
      member.authentication = JSON.stringify(newAuth);
      this.storageManager.update(member.id, member);
    }

    if (member.login.status === 'REMOVE') {
      return new Response(false, member.toObject(), 'Access denied. Please contact administrator.');
    }

    return new Response(true, member.toObject());
  }

  memberLookup(emailAddress) {
    const response = this.storageManager.getByKeyValue('emailAddress', emailAddress);
    if (response.length === 0) return null;

    const member = response.data[0];
    if (!member) return null;
    return member;
  }

  addMember(memberData) {
    let member = this.memberLookup(memberData.emailAddress);
    if (member) return member;
    member = this.storageManager.addMemberWithEmail(memberData.emailAddress);
    member.status = 'UNVERIFIED';
    member.timestamp = new Date();
    this.storageManager.update(member.id, member);
    return member;
  }

  addMemberRegistration(memberData) {
    let member = this.memberLookup(memberData.emailAddress);
    if (!member) {
      if (member && member.login.status === 'VERIFIED') {
        member.login.status = 'APPLIED';
      }
      Object.assign(member, memberData);
      this.storageManager.update(member.id, member);
    }
    return member;
  }

  setMemberStatus(id, status) {
    const memberResponse = this.storageManager.getById(id);
    if (memberResponse && memberResponse.success) {
      const member = memberResponse.data;
      member.status = status;
      this.storageManager.update(id, member);
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
    const member = this.memberLookup(emailAddress);
    if (!member) return { success: false, message: 'Member not found' };

    member.status = 'UNVERIFIED';
    this.storageManager.update(member.id, member);
    return { success: true, status: 'UNVERIFIED' };
  }

  getAuthentication(emailAddress) {
    const member = this.memberLookup(emailAddress);
    if (!member) return null;
    return member.login.authentication || null;
  }
}