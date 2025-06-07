

/**
 * ZohoOAuthSignon is a class that facilitates OAuth2 authentication with Zoho services.
 * It provides methods to generate authorization URLs, exchange authorization codes for tokens,
 * and refresh access tokens.
 *
 * @class ZohoOAuthSignon
 * @constructor
 * @param {Object} authConfig - Configuration object for Zoho OAuth2 authentication.
 * @param {string} authConfig.clientId - The client ID provided by Zoho.
 * @param {string} authConfig.clientSecret - The client secret provided by Zoho.
 * @param {string} authConfig.redirectUri - The URI to redirect to after authentication.
 * @param {string} authConfig.authUrl - The URL for initiating the OAuth2 authorization flow.
 * @param {string} authConfig.tokenUrl - The URL for exchanging authorization codes or refreshing tokens.
 */
class ZohoAPI {
    constructor(authConfig) {
        this.authConfig = authConfig || {};
    }

    /**
     * Makes an HTTP request and refreshes the access token if it is expired.
     * @param {string} url - The URL to make the request to.
     * @param {Object} options - The options for the HTTP request.
     * @returns {Object} The HTTP response object.
     */
    fetchWithTokenRefresh(url, options) {
        let response = UrlFetchApp.fetch(url, options);
        let code = response.getResponseCode();

        // If the access token is expired, refresh it and retry the request
        if (code === 401) {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token found. Please authenticate first.');
            }

            const tokens = this.refreshAccessToken(refreshToken);

            // Retry the request with the new access token
            options.headers.Authorization = 'Zoho-oauthtoken ' + tokens.access_token;
            response = UrlFetchApp.fetch(url, options);
        }

        return response;
    }
    /**
     * Exchanges a manually generated grant token (from Zoho Self Client) for access and refresh tokens.
     * @param {string} grantToken - The one-time grant token from Zoho Self Client.
     * @returns {Object} The token response object.
     */
    exchangeGrantTokenForToken(grantToken) {
        const params = {
            code: grantToken,
            client_id: this.authConfig.clientId,
            client_secret: this.authConfig.clientSecret,
            redirect_uri: this.authConfig.redirectUri,
            grant_type: 'authorization_code',
        };

        const options = {
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            payload: this.toQueryString(params),
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(this.authConfig.tokenEndpoint, options);
        const code = response.getResponseCode();
        const body = response.getContentText();

        if (code < 200 || code >= 300) {
            throw new Error(`Failed to exchange grant token: ${code} - ${body}`);
        }

        const tokens = JSON.parse(body);
        if (tokens.access_token) this.storeAccessToken(tokens.access_token);
        if (tokens.refresh_token) this.storeRefreshToken(tokens.refresh_token);
        return tokens;
    }

    /**
     * Refreshes the access token using the provided refresh token.
     * @param {string} refreshToken - The refresh token used to obtain a new access token.
     * @returns {Object} The response JSON containing the new access token and related data.
     */
    refreshAccessToken(refreshToken) {
        const params = {
            refresh_token: refreshToken,
            client_id: this.authConfig.clientId,
            client_secret: this.authConfig.clientSecret,
            grant_type: 'refresh_token',
        };

        const options = {
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            payload: this.toQueryString(params),
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(this.authConfig.tokenEndpoint, options);
        const code = response.getResponseCode();
        const body = response.getContentText();

        if (code < 200 || code >= 300) {
            throw new Error(`Failed to refresh access token: ${code} - ${body}`);
        }

        const tokens = JSON.parse(body);
        if (tokens.access_token) this.storeAccessToken(tokens.access_token);
        if (tokens.refresh_token) this.storeRefreshToken(tokens.refresh_token);
        return tokens;
    }

    /**
     * Converts an object to a query string for URL encoding.
     * @param {Object} params - The object to be converted to a query string.
     * @returns {string} The URL-encoded query string.
     */
    toQueryString(params) {
        return Object.keys(params)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
    }

    /**
     * Stores the access token securely using UserProperty.
     * @param {string} token - The access token to be stored.
     */
    storeAccessToken(token) {
        PropertiesService.getUserProperties().setProperty('zohoAccessToken', token);
    }

    /**
     * Retrieves the stored access token securely using UserProperty.
     * @returns {string|null} The stored access token, or null if not found.
     */
    getAccessToken() {
        return PropertiesService.getUserProperties().getProperty('zohoAccessToken');
    }

    /**
     * Stores the refresh token securely using UserProperty.
     * @param {string} token - The refresh token to be stored.
     */
    storeRefreshToken(token) {
        PropertiesService.getUserProperties().setProperty('zohoRefreshToken', token);
    }

    /**
     * Retrieves the stored refresh token securely using UserProperty.
     * @returns {string|null} The stored refresh token, or null if not found.
     */
    getRefreshToken() {
        return PropertiesService.getUserProperties().getProperty('zohoRefreshToken');
    }

    // --- Generalized Entity Methods ---
    generateUrl(entityType, id = '', params = {}) {
        const orgId = this.authConfig.organizationId;
        const apiBaseUrl = this.authConfig.apiBaseUrl || 'https://www.zohoapis.com/books/v3';
        let url = `${apiBaseUrl}/${entityType}`;
        if (id) url += `/${encodeURIComponent(id)}`;
        params.organization_id = orgId;
        const query = Object.keys(params)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
            .join('&');
        return `${url}?${query}`;
    }

    fetch(url, options = {}) {
        const accessToken = this.getAccessToken();
        if (!accessToken) throw new Error('No access token found. Please authenticate first.');
        options = Object.assign({
            method: 'get',
            headers: { Authorization: 'Zoho-oauthtoken ' + accessToken },
            muteHttpExceptions: true
        }, options);
        const response = this.fetchWithTokenRefresh(url, options);
        if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
           return {code: response.getResponseCode, message: response.getMessage(), content: null};
        }
        const body = response.getContentText();
        return JSON.parse(body);
    }

    // --- Generalized Entity Methods ---

    getEntity(entityType, id, params = {}) {
        const url = this.generateUrl(entityType, id, params);
        return this.fetch(url);
    }

    getEntities(entityType, params = {}) {
        const url = this.generateUrl(entityType, '', params);
        return this.fetch(url);
    }

    updateEntity(entityType, id, data) {
        const url = this.generateUrl(entityType, id);
        return this.fetch(url, {
            method: 'put',
            headers: {
                Authorization: 'Zoho-oauthtoken ' + this.getAccessToken(),
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(data),
            muteHttpExceptions: true
        });
    }

    createEntity(entityType, data) {
        const url = this.generateUrl(entityType);
        return this.fetch(url, {
            method: 'post',
            headers: {
                Authorization: 'Zoho-oauthtoken ' + this.getAccessToken(),
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(data),
            muteHttpExceptions: true
        });
    }

    deleteEntity(entityType, id) {
        const url = this.generateUrl(entityType, id);
        return this.fetch(url, {
            method: 'delete',
            headers: {
                Authorization: 'Zoho-oauthtoken ' + this.getAccessToken()
            },
            muteHttpExceptions: true
        });
    }
    // --- Derived Convenience Methods ---

    getAllCustomers() {
        const response = this.getEntities('contacts', { contact_type: 'customer' });
        return {code:response.code, message: response.message, customers: response.contacts}; 
    }

    getCustomerById(contactId) {
        const response = this.getEntity('contacts', contactId);
        return {code:response.code, message: response.message, customer: response.contact}; 
    }

    findCustomerByEmail(emailAddress) {
        const response = this.getEntities('contacts', { email: emailAddress });
        return {code:response.code, message: response.message, customers: response.contacts}; 
    }

    getAllVendors(params = {}) {
        const response =  this.getEntities('contacts', {...params, contact_type: 'vendor' });
        return {code:response.code, message: response.message, vendors: response.contacts}; 
    }

    getAllItems(params = {}) {
        return this.getEntities('items',params);
    }

    getItemByName(itemName) {
        return this.getEntities('items', { item_name: itemName });
    }   

    getItemById(itemId) {
        return this.getEntity('items', itemId);
    }
}

function newZohoAPI() {
    return new ZohoAPI(getAuthConfig());
}

function createRefreshToken() {
    const zohoAPI = new ZohoAPI(getAuthConfig());
    try {
        const tokens = zohoAPI.exchangeGrantTokenForToken(zohoAPI.authConfig.grantToken);
        Logger.log('Access token stored successfully.');
    } catch (error) {
        Logger.log(`Error exchanging grant token: ${error.message}`);
    }
}
// Example usage:
// 1. Generate a grant token in Zoho Self Client.
// 2. Exchange it for tokens:
// const zoho = new ZohoAPI(getAuthConfig());
// const tokens = zoho.exchangeGrantTokenForToken('YOUR_GRANT_TOKEN');
// Logger.log(tokens);
// 3. Store and use the refresh token for future access.

