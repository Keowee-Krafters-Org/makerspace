
const EVENT_CHAIRMAN_EMAIL = 'christopher.smith@keoweekrafters.org';

const NotificationModule = {
  notifyEventChair: function(name, classTitle, preferredDate) {
    const subject = '📚 New Instructor Class Request Submitted';
    const body = `Instructor: ${name}\nClass: ${classTitle}\nDate Options: ${preferredDate}\n\nReview and update in the Class Request Sheet: ${RESPONSE_SHEET_URL}`;
    MailApp.sendEmail(EVENT_CHAIRMAN_EMAIL, subject, body);
  },

  notifyInstructor: function(email, classTitle, startDate, room, link) {
    const timeZone = Session.getScriptTimeZone();
    MailApp.sendEmail(email,
      `Your class \"${classTitle}\" is scheduled`,
      `Thanks!\n\nYour class has been scheduled on ${Utilities.formatDate(startDate, timeZone, "MMM dd, yyyy 'at' h:mm a")}\nRoom: ${room}\n\nGoogle Calendar link: ${link}`);
  }
};
