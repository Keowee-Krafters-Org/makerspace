export class ZeffyAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.zeffy.com/api/v1';
    this.fetch = typeof UrlFetchApp !== 'undefined' ? UrlFetchApp.fetch : fetch;
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const fetchOptions = {
      ...options,
      headers: headers,
      muteHttpExceptions: true, // Important for UrlFetchApp to get error details
    };

    const response = await this.fetch(url, fetchOptions);
    // UrlFetchApp returns a different response object, so we need to handle it.
    const responseCode = typeof response.getResponseCode === 'function' ? response.getResponseCode() : response.status;
    const responseBody = typeof response.getContentText === 'function' ? response.getContentText() : await response.text();
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseBody);
    } catch (e) {
      jsonResponse = { message: 'Failed to parse JSON response.' };
    }

    if (responseCode < 200 || responseCode >= 300) {
      throw new Error(`Zeffy API Error: ${jsonResponse.message || `HTTP status ${responseCode}`}`);
    }

    return jsonResponse;
  }

  
  /**
   * Fetches a list of entities of a given type.
   * @param {string} entityType - The type of entity to fetch (e.g., 'payments', 'contacts').
   * @param {object} params - An object of query parameters.
   * @returns {Promise<object>}
   */
  getEntities(entityType, params = {}) {
    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    const endpoint = `${entityType}?${query}`;
    return this._request(endpoint);
  }

  /**
   * Fetches a single entity by its ID.
   * @param {string} entityType - The type of entity to fetch (e.g., 'payments', 'contacts').
   * @param {string} id - The ID of the entity.
   * @returns {Promise<object>}
   */
  getEntity(entityType, id) {
    const endpoint = `${entityType}/${id}`;
    return this._request(endpoint);
  }
}
