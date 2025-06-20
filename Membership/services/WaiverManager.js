class WaiverManager {
    constructor(storageManageManager, membershipManager) {
        this.destinationFolderId = SharedConfig.forms.waiver.destinationFolderId;
        this.templateId = SharedConfig.forms.waiver.templateId;
        this.membershipManager = membershipManager;
        this.storageManager = storageManageManager;
    }
    /**
     * Generate the document from the waiver form
     * Note: Any change to the form or the document must be synchronized with this function
     */
    generateWaiverDocument(email) {
               
        const responses = this.storageManager.getResponseByEmail(email); 

        const firstName = responses['First Name'];
        const lastName = responses['Last Name'];
        const signature = responses['Signature'];
        const formattedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

        // Create and personalize the Google Doc
        const copy = DriveApp.getFileById(this.templateId)
            .makeCopy(`${firstName} ${lastName} - Waiver`, DriveApp.getFolderById(this.destinationFolderId));
        const doc = DocumentApp.openById(copy.getId());
        const body = doc.getBody();

        body.replaceText('<<First Name>>', firstName);
        body.replaceText('<<Last Name>>', lastName);
        body.replaceText('<<Email>>', email);
        body.replaceText('<<Date>>', formattedDate);
        body.replaceText('<<Signature>>', signature);
        doc.saveAndClose();

        const pdf = copy.getAs(MimeType.PDF);
        const pdfFile = DriveApp.getFolderById(this.destinationFolderId).createFile(pdf);
        const pdfUrl = pdfFile.getUrl();
        DriveApp.getFileById(copy.getId()).setTrashed(true);
        const message = `Thank you for completing the waiver. A copy is attached for your records.\n\nMakeKeowee Team`; 
        this.sendEmail(
            email,`Your MakeKeowee Liability Waiver`, message,
            {attachments: [pdf]}
        );

        this.sendEmail(
            SharedConfig.emailAddress.admin,`New Waiver Submitted by ${firstName} ${lastName}`,`Name: ${firstName} ${lastName}\nEmail: ${email}\nDate: ${formattedDate}\nPDF: ${pdfUrl}`
        );

        const member = this.membershipManager.getMemberByEmail(email);
        if (member) {
            member.registration.pdfLink = pdfUrl;
            member.waiverSigned = true;
            this.membershipManager.updateMember(member);
        } else {
            console.warn(`Member not found for email: ${email}. Waiver will not be associated with a member.`);
        }
    }

    /**
     * Use the Googgle Drive API to get the list of waivers
     * @returns 
     */
    getWaivers() {
        return this.waivers;
    }

    findWaiverById(id) {
        return this.waivers.find(waiver => waiver.id === id);
    }

    removeWaiver(id) {
        this.waivers = this.waivers.filter(waiver => waiver.id !== id);
    }

    /** Send and email
     * Note: refactor this to use the EmailManager
     * @param {string} emailAddress - The email address to send the waiver to.
     * @param {string} title - The subject of the email.
     * @param {string} message - The body of the email.
     * @returns {void}
     * @throws {Error} If the email address is invalid or if sending fails.
     */
    sendEmail(emailAddress, title, message) {
        console.info(`Sending waiver to: ${emailAddress}`);
        GmailApp.sendEmail(emailAddress, title, message, {
            from: 'noreply@keoweekrafters.org',
            name: 'KeoweeKrafters',
            noReply: true
        });
    }
}

