class ZohoFieldMap {
  constructor(map) {
    this.map = map;
  }

  // Convert from Zoho object to local object
  fromZoho(zohoObj) {
    const result = {};
    for (const localKey of Object.keys(this.map)) {
      const zohoKey = this.map[localKey];
      if (zohoObj[zohoKey] !== undefined) {
        result[localKey] = zohoObj[zohoKey];
      }
    }
    return result;
  }

  // Convert from local object to Zoho object
  toZoho(localObj) {
    const result = {};
    for (const localKey of Object.keys(localObj)) {
      const zohoKey = this.map[localKey];
      if (zohoKey && localObj[localKey] !== undefined) {
        result[zohoKey] = localObj[localKey];
      }
    }
    return result;
  }
}