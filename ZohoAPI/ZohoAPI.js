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
            headers: {
                Authorization: 'Zoho-oauthtoken ' + accessToken,
                'Content-Type': 'application/json'
            },
            muteHttpExceptions: true
        }, options);
        const response = this.fetchWithTokenRefresh(url, options);

        Logger.log(`Code: ${response.getResponseCode()}`);
        if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
            return { code: response.getResponseCode, message: response.getContentText(), content: null };
        }
        const body = response.getContentText();
        return JSON.parse(body);
    }

    get(entityType, id = '', params = {}) {
        // Generate the URL for the GET request
        const url = this.generateUrl(entityType, id, params);
        return this.fetch(url, { method: 'get' });
    }
    post(entityType, payload) {
        const url = this.generateUrl(entityType);
        return this.fetch(url, {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload)
        });
    }

    put(entityType, id, payload) {
        // Wrap data in the resource key if needed
        const url = this.generateUrl(entityType, id);
        return this.fetch(url, {
            method: 'put',
            contentType: 'application/json',
            payload: JSON.stringify(payload)
        });
    }
    // --- Generalized Entity Methods ---

    /**
     *  Retrieves a single entity by its type and ID, ensuring that custom fields
     *  are included as top-level fields in the response.
     *  This method handles the case where Zoho API returns custom fields in a hash format.
     *  It converts each entry in the custom_field_hash to a top-level cf_xx field.
     *  This is particularly useful for multi-line custom fields that are not included in the list response.
     * @param {*} entityType 
     * @param {*} id 
     * @param {*} params 
     * @returns 
     */
    getEntity(entityType, id, params = {}) {
        const url = this.generateUrl(entityType, id, params);
        const response = this.fetch(url);

        // If the response contains an 'item' with 'custom_field_hash', convert each entry to a cf_xx field
        if (response && response.item && response.item.custom_field_hash) {
            const hash = response.item.custom_field_hash;
            Object.keys(hash).forEach(apiName => {
                // Only add if not already present as a top-level field
                const cfKey = apiName;
                if (!(cfKey in response.item) && !cfKey.endsWith('_unformatted')) {
                    response.item[cfKey] = hash[apiName];
                }
            });
        }

        return response;
    }

    getEntities(entityType, params = {}) {
        if( entityType === 'items') {
            // Call getEntitiesWithCustomFields to ensure custom fields are handled correctly
            return this.getEntitiesWithCustomFields(entityType, params);
        }
        return this.get(entityType, '', params); // Empty id for collection retrieval
    }

    // Utility to package cf_xx fields into custom_fields array for Zoho API
    packageCustomFields(data) {
        const customFields = [];
        const payload = {};

        Object.keys(data).forEach(key => {
            if (key.startsWith('cf_')) {
                customFields.push({ api_name: key, value: data[key] });
            } else {
                payload[key] = data[key];
            }
        });

        if (customFields.length > 0) {
            payload.custom_fields = customFields;
        }
        return payload;
    }

    updateEntity(entityType, id, data) {
        const payload = this.packageCustomFields(data);
        return this.put(entityType, id, payload);
    }

    createEntity(entityType, data) {
        const payload = this.packageCustomFields(data);
        return this.post(entityType, payload);
    }

    deleteEntity(entityType, id) {
        const url = this.generateUrl(entityType, id);
        return this.fetch(url, {
            method: 'delete'
        });
    }
    // --- Derived Convenience Methods ---

    getAllCustomers() {
        const response = this.getEntities('contacts', { contact_type: 'customer' });
        return { code: response.code, message: response.message, customers: response.contacts };
    }

    getCustomerById(contactId) {
        const response = this.getEntity('contacts', contactId);
        return { code: response.code, message: response.message, customer: response.contact };
    }

    findCustomerByEmail(emailAddress) {
        const response = this.getEntities('contacts', { email: emailAddress });
        return { code: response.code, message: response.message, customers: response.contacts };
    }

    getAllVendors(params = {}) {
        const response = this.getEntities('contacts', { ...params, contact_type: 'vendor' });
        return { code: response.code, message: response.message, vendors: response.contacts };
    }

    getAllItems(params = {}) {
        return this.getEntities('items', params);
    }

    getItemByName(itemName) {
        return this.getEntities('items', { item_name: itemName });
    }

    getItemById(itemId) {
        return this.getEntity('items', itemId);
   }

    /**
     * Retrieves all entities and ensures custom fields (including multi-line) are set as top-level cf_xx fields.
     * This works around the Zoho API bug where multi-line custom fields are not included in the list response.
     * @param {string} entityType - The Zoho entity type (e.g., 'items').
     * @param {Object} params - Query parameters for the list API.
     * @returns {success, <entityTypes>: [{entity}, {entity}] Array of entities with custom fields as top-level cf_xx fields.
     */
    getEntitiesWithCustomFields(entityType, params = {}) {
        const listResponse = this.get(entityType, '', params);
        const entities = listResponse[entityType] || [];

        // For each entity, fetch the full record and merge custom fields
        listResponse[entityType] = entities.map(entity => {
            const full = this.getEntity(entityType, entity.item_id || entity.id);
            // Merge all top-level fields from the full entity into the list entity
            if (full && full.item) {
                return Object.assign({}, entity, full.item);
            }
            return entity;
        });
        return listResponse; 
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

