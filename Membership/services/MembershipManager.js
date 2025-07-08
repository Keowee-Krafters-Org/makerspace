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
    return this.storageManager.getAll();
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
    // Assume expired or new login
    let expired = true;
    if (!member) {
      member = this.addMember({ emailAddress });
    }

    if (member.login) {
      // Has a login 
      expired = member.login.isExpired();;
    }

    if (expired) {
      member.login.authentication = this.generateAuthentication();
      member.login.status = "VERIFYING";
      this.storageManager.update(member.id, member);
    }

    if (!expired && member.registration && member.registration.status === 'REGISTERED') {
      member.login.status = 'VERIFIED';
      this.storageManager.update(member.id, member);
    }

    if (member.login && member.login.status === 'VERIFYING') {
      this.sendEmail({
        emailAddress:emailAddress, 
        title: 'Your MakeKeowee Login Code',
        message:`Your verification code is: ${member.login.authentication.token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`});
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
      member.login.status = 'UNVERIFIED';
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
      member.login.status = 'VERIFIED';
      // Extend token expiration to 4 hours
      const newAuth = this.generateAuthentication(240);
      newAuth.token = authentication.token;
      member.login.authentication = newAuth;
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
    return this.storageManager.getById(member.id).data;
  }

  addMember(memberData) {
    let member = this.memberLookup(memberData.emailAddress);
    if (member) return member;
    member = this.storageManager.createNew(memberData);
    const newMember = this.storageManager.add(member);
    return newMember;
  }

  getMember(memberId) {
    return (this.storageManager.getById(memberId)); 
  }
  addMemberRegistration(memberData) {
    let registeredMember = this.storageManager.create(memberData); 
    let member = this.memberLookup(memberData.emailAddress);
    if (!member) {
      member = addMember(memberData);
    }
    Object.assign( member, registeredMember);
    if (member && member.login.status === 'VERIFIED') {
      registeredMember.registration.status = 'APPLIED';
    }
    member = this.storageManager.update(member.id, registeredMember);
    return member;
  }

  setMemberStatus(id, status) {
    const memberResponse = this.storageManager.getById(id);
    if (memberResponse && memberResponse.success) {
      const member = memberResponse.data;
      member.login.status = status;
      this.storageManager.update(id, member);
    }
  }

  /**
   * Send an email based on the emailPacket
   * The packet contains: 
   * emailAddress
   * title, 
   * message,
   * attachments (optional)
   * @param {*} emailPacket 
   */
  sendEmail(emailPacket) {

    console.info(`Sending email ${emailPacket.title} to: ${emailPacket.emailAddress}`);
    GmailApp.sendEmail(emailPacket.emailAddress, emailPacket.title, emailPacket.message, {
      from: 'noreply@keoweekrafters.org',
      name: 'KeoweeKrafters',
      attachments: emailPacket.attachments || [], 
      noReply: true
    });
  }

  memberLogout(emailAddress) {
    const member = this.memberLookup(emailAddress);
    if (!member) return { success: false, message: 'Member not found' };

    member.login.status = 'UNVERIFIED';
    this.storageManager.update(member.id, member);
    return { success: true, login: { status: 'UNVERIFIED' } };
  }

  getAuthentication(emailAddress) {
    const member = this.memberLookup(emailAddress);
    if (!member) return null;
    return member.login.authentication || null;
  }

  deleteMember(member) {
    this.storageManager.delete(member.id); 
  }

  getHosts() {
    return this.storageManager.getFiltered(m => m.registration && m.registration.level >= SharedConfig.levels.host); 
  }

  getInstructors() {
    // Use ZohoStorageManager's getFiltered to find members with level > Instructor
    const instructorLevel = SharedConfig.levels.Instructor;
    const response = this.storageManager.getFiltered(
      member => {
        const memberLevel = SharedConfig.levels[member.registration.level]; 
        // Ensure level is a number for comparison
        return memberLevel > instructorLevel;
      }, {per_page:200}
    );
    // Return only the data array (list of instructors)
    return response.data;
  }

  
}