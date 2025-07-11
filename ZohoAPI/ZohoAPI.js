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
        if (id && id != '') url += `/${encodeURIComponent(id)}`;
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

        return  this.fetch(url, {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload)
        });
        
    }

    put(entityType, id, payload) {
        // Wrap data in the resource key if needed
        const url = this.generateUrl(entityType, id);

        return  this.fetch(url, {
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
        return this.processCustomFields(entityType,response);
    }

    processCustomFields(entityType, response) {
      const entityTypeSingular = entityType.slice(0, -1); // Remove trailing 's' for singular form
        if (!response || !response[entityTypeSingular]) {
            throw new Error(`Entity ${entityTypeSingular} not created: ${response.message}.`);
        }
        let entity = response[entityTypeSingular];
        // Convert custom_field_hash to top-level cf_xx fields
        entity = this.getCustomFields(entity);
        // Remove the custom_field_hash to avoid confusion
        // Ensure the response contains the singular form of the entity
        response[entityTypeSingular] = entity; // Ensure the singular form is used in the response
        return response;
    }

    getEntities(entityType, params = {}) {
        // Use object destructuring to set default pagination values.
        // If 'page' or 'per_page' are not provided in params, they default to 1 and 10.
        // The '...rest' syntax collects any other parameters into a separate object.
        const { page = 1, per_page = 10, ...rest } = params;
        const queryParams = { page, per_page, ...rest };
        const entitiesResponse = this.get(entityType, '', queryParams); // Empty ID for collection retrieval
        return this.getCustomFieldsForList(entitiesResponse, entityType);
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
         const response =  this.put(entityType, id, payload);
         return this.processCustomFields(entityType,response);
    }

    createEntity(entityType, data) {
        const payload = this.packageCustomFields(data);
        const response =  this.post(entityType, payload);
   
        return this.processCustomFields(entityType,response);

    }

    deleteEntity(entityType, id) {
        const url = this.generateUrl(entityType, id);
        return this.fetch(url, {
            method: 'delete'
        });
    }
    // --- Derived Convenience Methods ---



    /**
     * Ensures custom fields are set as top-level cf_xx fields for a list of entities.
     * This method processes each entity in the list response and merges custom fields
     * from the full record into the entity object.
     * @param {Object} listResponse - The response object containing the list of entities.
     * @param {string} entityType - The Zoho entity type (e.g., 'items').
     * @returns {Object} The updated list response with entities having custom fields as top-level cf_xx fields.
     */
    getCustomFieldsForList(listResponse, entityType) {
        const entities = listResponse[entityType] || [];
       const entityTypeSingular = entityType.slice(0, -1); // Remove trailing 's' for singular form
 
        // For each entity, fetch the full record and merge custom fields
        listResponse[entityType] = entities.map(entity => {
            const full = this.getEntity(entityType, entity[`${entityTypeSingular}_id`]);
            return full[entityTypeSingular]; 
        });
        return listResponse;
    }
    /**
     * Processes the custom_field_hash object in the entity and promotes its fields
     * to top-level fields in the entity object. This ensures custom fields are easily
     * accessible as top-level properties.
     * 
     * @param {Object} entity - The entity object containing custom fields.
     * @returns {Object} The updated entity object with custom fields as top-level properties.
     */
    getCustomFields(entity) {
        if (entity.custom_field_hash) {
            const hash = entity.custom_field_hash;

            // Iterate over each key in the custom_field_hash
            Object.keys(hash).forEach(cfKey => {
                // Promote the field to a top-level property if it doesn't already exist
                 // Use the API name directly as the top-level key
                if (!(cfKey in entity)) {
                    entity[cfKey] = hash[cfKey];
                }
            });

            // Remove the original custom_field_hash object to avoid redundancy
            delete entity.custom_field_hash;

            // Remove the custom_fields array if it exists, as we are using top-level fields
            delete entity.custom_fields;
        }

        return entity;
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

