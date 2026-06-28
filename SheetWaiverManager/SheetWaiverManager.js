import { Waiver } from './Waiver.js';
import {Waiver} from '@makerspace/membership-common';
export class SheetWaiverManager {


     /**
       * Generate the document from the waiver form
       * Note: Any change to the form or the document must be synchronized with this function
       */
      generateWaiverDocument(response) {
  
          const itemResponses = this.storageManager.getResponseData(response);
          const waiver = Waiver.fromRecord(itemResponses);
  
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
  
          this.sendEmail({
              emailAddress: this.config.emailAddress.admin,
              title: `New Waiver Submitted by ${firstName} ${lastName}`,
              message: `Name: ${firstName} ${lastName}\nEmail: ${email}\nDate: ${formattedDate}\nPDF: ${pdfUrl}`
          }
          );
  
          const member = this.membershipManager.memberLookup(email);
          if (member) {
              member.registration.waiverPdfLink = pdfUrl;
              member.registration.waiverSigned = true;
              member.registration.status = 'PENDING'; 
              //this.membershipManager.updateMember(member);
          } else {
              console.warn(`Member not found for email: ${email}. Waiver will not be associated with a member.`);
          }
          return waiver;
  
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
      from: this.config?.emailAddress?.from || 'noreply@keoweekrafters.org',
      name: 'KeoweeKrafters',
      attachments: emailPacket.attachments || [],
      noReply: true
    });
  }

}
