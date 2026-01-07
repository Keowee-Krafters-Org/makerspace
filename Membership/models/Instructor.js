/**
 * Instructor.js
 * Represents an instructor who is a vendor in Zoho.
 * Extends the base Contact class.
 * @extends Contact
 */
class Instructor extends Contact {
  constructor(data = {}) {
    super(data);
  }

    toObject() {
    return {...super.toObject(),
      instructor: this.instructor,
    };
  }

  createNew(data = {}) {
    const lastName = data.lastName || `Instructor_${Math.floor(1000 + Math.random() * 9000)}`; 
    return new Instructor({
      id: data.id || '', // or generate new ID if needed
      emailAddress: data.emailAddress || '',
      firstName: data.firstName || 'New',
      lastName: lastName,
      name: `${data.firstName} ${lastName}`, 
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      instructor: true
    });
  }
}
