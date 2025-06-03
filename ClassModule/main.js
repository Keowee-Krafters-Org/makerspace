/**
 * Constants
 */
const MEMBER_DISCOUNT = 10.00; 
/**
 * Handle instructor form submission
 */
function handleInstructorFormSubmission(e) {
  if (!e || !e.namedValues) {
    Logger.log("Error: e.namedValues is missing");
    return;
  }
  
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const classTitle = getCellValueFromNamedColumn('title', row);
  const preferredDate = getCellValueFromNamedColumn('preferredDate', row); 
  NotificationModule.notifyEventChair(formData['Name'][0], classTitle, preferredDate);
}

/**
 * Handle spreadsheet edit to update calendar
 */
function handleSheetUpdate(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();

  let editMode = 'NO_OP';
  const approvedCol = SheetModule.getNamedRange('approvedFlag').getColumn();
  const eventId = SheetModule.getCellValue('calendarEventId', row);

  if (range.getColumn() === approvedCol) {
    const isApproved = sheet.getRange(row, approvedCol).getValue();
    if (isApproved !== true && isApproved.toString().toLowerCase() !== 'yes' && isApproved !== '✅') {
      editMode = 'DISABLE';
    } else if (!eventId) {
      editMode = 'NEW';
    } else {
      editMode = 'EDIT';
    }
  } else if (eventId) {
    editMode = 'EDIT';
  }

  const preferredDate = SheetModule.getCellValue('preferredDate', row);
  const classTitle = SheetModule.getCellValue('title', row);
  const description = SheetModule.getCellValue('description', row);
  const instructor = SheetModule.getCellValue('instructorName', row);
  const instructorEmail = SheetModule.getCellValue('emailAddress', row);
  var dateValue = SheetModule.getCellValue('startDate', row);
  const duration = parseInt(SheetModule.getCellValue('duration', row));
  const room = SheetModule.getCellValue('location', row);
  const finalCost = SheetModule.getCellValue('cost', row);
  const classFee = Number.parseFloat(finalCost); 
  const memberFee = classFee - classFee*(MEMBER_DISCOUNT/100.00); 
  const timeZone = Session.getScriptTimeZone();
  const startDate = dateValue?new Date(dateValue):new Date(preferredDate);
  const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

const formattedDate = Utilities.formatDate(startDate, timeZone, "MMM dd, yyyy 'at' h:mm a");

const eventDescription = `${description}\n\n${Utilities.formatString(
  "Class Details:\nInstructor: %s\nDate: %s\nLocation: %s\nFee: $%.2f\nActive Member Fee: $%.2f",
  instructor,
  formattedDate,
  room,
  classFee,
  memberFee
)}`;

const eventData = {
  summary: classTitle,
  description: eventDescription,
  location: room,
  start: {
    dateTime: Utilities.formatDate(startDate, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    timeZone: timeZone
  },
  end: {
    dateTime: Utilities.formatDate(endDate, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    timeZone: timeZone
  },
  attendees: [{ email: instructorEmail }]
};


  switch (editMode) {
    case 'NEW':
      const created = CalendarModule.createEvent(eventData);
      SheetModule.setCellValue('calendarEventLink', row, created.htmlLink);
      SheetModule.setCellValue('calendarEventId', row, created.id);
      SheetModule.setCellValue('startDate', row, startDate);
      NotificationModule.notifyInstructor(instructorEmail, classTitle, startDate, room, created.htmlLink);
      break;

    case 'EDIT':
      CalendarModule.updateEvent(eventData, eventId);
      break;

    case 'DISABLE':
      CalendarModule.deleteEvent(eventId);
      SheetModule.clearCellValue('calendarEventLink', row);
      SheetModule.clearCellValue('calendarEventId', row);
      break;
  }
}

