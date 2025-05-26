/**
 * Lookup class acts as a carrier for lookup results.
 * It stores the LookupState and Member objects, along with any additional
 * fields returned by the memberLookup method in Membership.
 */
class Lookup {
  constructor(found, rowIndex, columnIndexByName, sheet, data = {}) {
    this.found = found; 
    this.rowIndex = rowIndex; 
    this.columnIndexByName = columnIndexByName; 
    this.sheet = sheet;
    this.member = new Member(data);
  }

    toObject() {
    return {
      found: this.found,
      rowIndex: this.rowIndex,
      columnIndexByName: { ...this.columnIndexByName },
      member: this.member.toObject()
    };
  }

    hasAdminAccess(requiredLevel) {
    return this.level >= requiredLevel;
  }
} 
