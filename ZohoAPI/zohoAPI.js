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

    /**
     * Retrieves all customers (contacts) from Zoho Books using the stored access token.
     * If the access token is expired, it attempts to refresh it using the stored refresh token.
     * @param {string} organizationId - The Zoho Books organization ID.
     * @returns {Object} The response JSON containing the list of customers.
     */
    getAllCustomers(organizationId) {
        let accessToken = this.getAccessToken();
        if (!accessToken) {
            throw new Error('No access token found. Please authenticate first.');
        }

        const orgId = organizationId || this.authConfig.organizationId;
        const apiBaseUrl = this.authConfig.apiBaseUrl || 'https://books.zoho.com/api/v3';
        const url = `${apiBaseUrl}/contacts?organization_id=${encodeURIComponent(orgId)}`;
        const options = {
            method: 'get',
            headers: {
                Authorization: 'Zoho-oauthtoken ' + accessToken
            },
            muteHttpExceptions: true
        };

        const responseObject = this.fetchWithTokenRefresh(url, options);
        const responseText = responseObject.getContentText();
        const response = JSON.parse(responseText); 
        if (response.code != 0) {
          throw new Error (`All Customers call failed with code: ${response.message}`); 
        }
        return {
            code: response.code,
            message: response.message, 
            customers: response.contacts.filter(contact => contact.contact_type === 'customer')};
    }


/**
 * Retrieves a single customer (contact) from Zoho Books by contact ID using the stored access token.
 * @param {string} organizationId - The Zoho Books organization ID.
 * @param {string} contactId - The Zoho Books contact (customer) ID.
 * @returns {Object} The response JSON containing the customer details.
 */
getCustomerById(organizationId, contactId) {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
        throw new Error('No access token found. Please authenticate first.');
    }
    const orgId = organizationId || this.authConfig.organizationId;
    const apiBaseUrl = this.authConfig.apiBaseUrl || 'https://www.zohoapis.com/books/v3';
    const url = `${apiBaseUrl}/contacts/${encodeURIComponent(contactId)}?organization_id=${encodeURIComponent(orgId)}`;
    const options = {
        method: 'get',
        headers: {
            Authorization: 'Zoho-oauthtoken ' + accessToken
        },
        muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const body = response.getContentText();
    if (code < 200 || code >= 300) {
        throw new Error(`Failed to fetch customer: ${code} - ${body}`);
    }
    return JSON.parse(body);
}
 
/**
 * Finds a customer (contact) in Zoho Books by email address.
 * @param {string} organizationId - The Zoho Books organization ID.
 * @param {string} emailAddress - The email address to search for.
 * @returns {Object|null} The customer object if found, otherwise null.
 */
findCustomerByEmail(organizationId, emailAddress) {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
        throw new Error('No access token found. Please authenticate first.');
    }
    const orgId = organizationId || this.authConfig.organizationId;
    const apiBaseUrl = this.authConfig.apiBaseUrl || 'https://www.zohoapis.com/books/v3';
    const url = `${apiBaseUrl}/contacts?organization_id=${encodeURIComponent(orgId)}&email=${encodeURIComponent(emailAddress)}`;
    const options = {
        method: 'get',
        headers: {
            Authorization: 'Zoho-oauthtoken ' + accessToken
        },
        muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const body = response.getContentText();
    if (code < 200 || code >= 300) {
        throw new Error(`Failed to search customer by email: ${code} - ${body}`);
    }
    const data = JSON.parse(body);
    if (data.contacts && data.contacts.length > 0) {
        // Return the first matching customer
        return data.contacts[0];
    }
    return null;
}
}

function getZohoAPI() {
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

