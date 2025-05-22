// Member.js — Structured Member class used throughout the app

class Member {
  constructor(data = {}) {
    this.emailAddress = data.emailAddress || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.address = data.address || '';
    this.interests = data.interests || '';
    this.level = data.level || 0;
    this.status = data.status || 'UNVERIFIED';
    this.memberStatus = data.memberStatus || 'NEW';
    this.authentication = data.authentication || null;
    this.waiverDate = data.waiverDate || '';
    this.waiverPdfLink = data.waiverPdfLink || '';
  }

  static fromRow(row, colMap) {
    const member = new Member();
    for (const [key, colIndex] of Object.entries(colMap)) {
      member[key] = row[colIndex - 1]; // Convert 1-based index to 0-based
    }
    return member;
  }

  toObject() {
    return { ...this };
  }
}
