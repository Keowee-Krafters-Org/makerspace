// Membership.gs — Core membership logic shared by web app and form triggers
// Uses Member, Login, and Registration classes

class MembershipManager {
  /**
   * @param {StorageManager} storageManager - An instance of a storage manager (e.g., SheetStorageManager)
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  getAllMembers(params = {}) {
    return this.storageManager.getAll(params);
  }

  /**
   * Updates a member from an object.
   * This method creates a new Member instance from the provided object and updates it in the storage.
   * @param {Object} memberObject - The member object containing updated data.
   * @returns {Response} The response object containing the success status and updated member data.
  * @throws {Error} If the member object is invalid or the update fails.
   */
  updateMemberFromObject(memberObject) {
    const member = this.storageManager.createNew(memberObject);
    return this.updateMember(member);
  }
  /**
   * Updates a member in the storage.
   * This method updates the member's data in the storage and returns a response.
   * @param {Member} member - The member instance to update.
   * @returns {Response} The response object containing the success status and updated member data.
   * @throws {Error} If the member is not found or the update fails.
   * 
   */
  updateMember(member) {

    if (!member) throw new Error(`Member not found: ${member.emailAddress}`);
    if (!member.id) throw new Error(`Member ID missing: ${member.emailAddress}`);
    if (!member.name) throw new Error(`Member name missing: ${member.name}`);
    try {
      const response = this.storageManager.update(member.id, member);
      return response;
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

    // Check for existing login and not in verifying state
    // This prevents verification bypass for existing members
    
      if (member.login) {
        // Has a login 
        expired = member.login.isExpired();;
      }

      if (expired) {
        member.login.authentication = this.generateAuthentication();
        member.login.status = "VERIFYING";
        member = this.storageManager.update(member.id, member).data;
      }

      if (!expired && member.registration && member.registration.status === 'REGISTERED') {
        member.login.status = 'VERIFIED';
        member = this.storageManager.update(member.id, member).data;
      }

      if (member.login && member.login.status === 'VERIFYING') {
        this.sendEmail({
          emailAddress: emailAddress,
          title: 'Your MakeKeowee Login Code',
          message: `Your verification code is: ${member.login.authentication.token}\nIt expires in ${SharedConfig.loginTokenExpirationMinutes} minutes.`
        });
      }
    
    return new Response(true, member);
  }

  generateAuthentication(durationMinutes = SharedConfig.loginTokenExpirationMinutes) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    return { token, expirationTime };
  }

  verifyMemberToken(emailAddress, userToken) {
    // Lookup the member by email address
    let member = this.memberLookup(emailAddress);

    // Default response - no access
    let response = new Response(false,
      this.storageManager.createNew(getConfig().defaultMember),
      'Member not found');
    if (!member) {
      return response;
    }

    // Use the member's login authentication
    response.data = member;
    if (!member.login || !member.login.authentication) {
      // No in verification mode
      member.login.status = 'UNVERIFIED';
      response = this.storageManager.update(member.id, member);
      response.success = false;
      response.message = 'Member login not found. Please request a verification code.';
      return response;
    }

    const authentication = member.login.authentication;
    const expirationTime = authentication.expirationTime;
    if (new Date() > new Date(expirationTime)) {
      // Token expired
      response.message = 'Token expired. Please request a new one.';
      return response;
    }

    if (userToken !== authentication.token) {
      // Token mismatch
      response.message = 'Invalid token. Please check and try again.';
      return response;
    }

    if (member.login.status === 'REMOVE') {
      // Member is banned
      response.message = 'Access denied. Please contact administrator.';
      return response;
    }

    if (member.login.status === 'VERIFYING' || member.login.status === 'TOKEN_EXPIRED') {
      member.login.status = 'VERIFIED';
      // Extend token expiration to 4 hours
      const newAuth = this.generateAuthentication(240);
      newAuth.token = authentication.token;
      member.login.authentication = newAuth;
      response = this.storageManager.update(member.id, member);
    }

    if (member.login.status === 'REMOVE') {
      response = new Response(false, member, 'Access denied. Please contact administrator.');
    }
    return response;
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
    let registeredMember = this.storageManager.createNew(memberData);
    let member = this.memberLookup(memberData.emailAddress);
    if (!member) {
      member = addMember(memberData);
    }
    registeredMember.id = member.id;
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

    member.login = ZohoLogin.createNew({ status: 'UNVERIFIED' });
    this.storageManager.update(member.id, member);
    return { success: true, data: member };
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
    return this.storageManager.getFiltered(m => m.registration && m.registration.level >= SharedConfig.levels.Host.value);
  }

  getInstructors() {
    // Use ZohoStorageManager's getFiltered to find members with level > Instructor
    const instructorLevel = SharedConfig.levels.Instructor.value;
    const response = this.storageManager.getFiltered(
      member => {
        const memberLevel = SharedConfig.levels[member.registration.level].value;
        // Ensure level is a number for comparison
        return memberLevel >= instructorLevel;
      }, { contactType: 'vendor', per_page: 200 }
    );
    // Return only the data array (list of instructors)
    return response.data;
  }

  createNew(data = {}) {
    const member = this.storageManager.createNew(data);
    member.discount = MembershipManager.calculateDiscount(member);
    return member;
  }
  
  static calculateDiscount(member) {
    if (!member || !member.registration) return 0;
    const level = member.registration.level;
    return SharedConfig.levels[level]?.discount || 0;
  }

  /**
   * Retrieves members from a list of contacts.
   * @param {Array<Object>} contactList - An array of contact objects, each containing at least an emailAddress property.
   * @returns {Array<Object>} An array of member objects corresponding to the contacts.
   */
  getMembersFromContacts(contactList = []) {
    if (!Array.isArray(contactList) || contactList.length === 0) {
      throw new Error('Invalid contact list. Please provide a non-empty array of contacts.');
    }

    return this.getMembersFromEmails(contactList.map(contact => 
      contact.emailAddress)); 
  }

 
  /**
   * Retrieves members from a list of contacts with email-only data.
   * @param {Array<string>} emailList - An array of email addresses.
   * @returns {Array<Object>} An array of member objects corresponding to the email addresses.
   */
  getMembersFromEmails(emailList = []) {
    if (!Array.isArray(emailList) || emailList.length === 0) {
      throw new Error('Invalid email list. Please provide a non-empty array of email addresses.');
    }

    const members = emailList.map(email => {
      const member = this.memberLookup(email);
      if (!member) {
        console.warn(`No member found for email: ${email}`);
        return null; // Return null for emails without a corresponding member
      }
      return member;
    });

    // Filter out null values (emails without corresponding members)
    return members.filter(member => member !== null);
  }

}