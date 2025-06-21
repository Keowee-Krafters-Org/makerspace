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

        const response = this.storageManager.getResponseByEmail(email);
        const itemResponses = this.storageManager.getResponseData(response);
        const waiver = FormWaiver.fromRecord(itemResponses);

        const firstName = waiver.firstName;
        const lastName = waiver.lastName;
        const signature = waiver.signature;
        const timestamp = waiver.timestamp;

        const formattedDate = Utilities.formatDate(new Date(timestamp), Session.getScriptTimeZone(), 'yyyy-MM-dd');

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
        waiver.pdfLink = pdfUrl;
        waiver.emailAddress = email;

        DriveApp.getFileById(copy.getId()).setTrashed(true);
        const message = `Thank you for completing the waiver. A copy is attached for your records.\n\nMakeKeowee Team`;
        this.membershipManager.sendEmail({
            emailAddress: email,
            title: `Your MakeKeowee Liability Waiver`, message,
            attachments: [pdf]
        }
        );

        this.membershipManager.sendEmail({
            emailAddress: SharedConfig.emailAddress.admin,
            title: `New Waiver Submitted by ${firstName} ${lastName}`,
            message: `Name: ${firstName} ${lastName}\nEmail: ${email}\nDate: ${formattedDate}\nPDF: ${pdfUrl}`
        }
        );

        const member = this.membershipManager.memberLookup(email);
        if (member) {
            member.registration.waiverPdfLink = pdfUrl;
            member.registration.waiverSigned = true;
            this.membershipManager.updateMember(member);
        } else {
            console.warn(`Member not found for email: ${email}. Waiver will not be associated with a member.`);
        }
        return waiver;

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


}

