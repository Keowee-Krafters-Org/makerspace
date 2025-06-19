// MemberPortal/zohoAuthorization.test.js

const TEST_CONFIG = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost', // For Self Client, can be anything
    tokenUrl: 'https://accounts.zoho.com/oauth/v2/token'
};

function mockFetchSuccess(responseObj) {
    globalThis.fetch = function () {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(responseObj)
        });
    };
}

function mockFetchFailure(statusText) {
    globalThis.fetch = function () {
        return Promise.resolve({
            ok: false,
            statusText: statusText,
            text: () => Promise.resolve(statusText)
        });
    };
}
   function assert(condition, message) {
        if (!condition) {
            Logger.log(`Test failed: ${message}`);
        } else {
            Logger.log(`Test passed: ${message}`);
        }
    }
function runTests() {
    const zoho = new ZohoAPI(TEST_CONFIG);

 

    // Test: exchangeGrantTokenForToken returns token on success
    const mockGrantResponse = { access_token: 'abc', refresh_token: 'def' };
    mockFetchSuccess(mockGrantResponse);
    zoho.exchangeGrantTokenForToken('testgrant').then(result => {
        assert(JSON.stringify(result) === JSON.stringify(mockGrantResponse), 'exchangeGrantTokenForToken returns correct token');
    }).catch(error => {
        Logger.log(`Test failed: exchangeGrantTokenForToken threw an error - ${error.message}`);
    });

    // Test: exchangeGrantTokenForToken throws on failure
    mockFetchFailure('Bad Request');
    zoho.exchangeGrantTokenForToken('badgrant').then(() => {
        Logger.log('Test failed: exchangeGrantTokenForToken did not throw on failure');
    }).catch(error => {
        assert(error.message.includes('Failed to exchange grant token'), 'exchangeGrantTokenForToken throws correct error on failure');
    });

    // Test: refreshAccessToken returns token on success
    const mockRefreshResponse = { access_token: 'newtoken', expires_in: 3600 };
    mockFetchSuccess(mockRefreshResponse);
    zoho.refreshAccessToken('refresh123').then(result => {
        assert(JSON.stringify(result) === JSON.stringify(mockRefreshResponse), 'refreshAccessToken returns correct token');
    }).catch(error => {
        Logger.log(`Test failed: refreshAccessToken threw an error - ${error.message}`);
    });

    // Test: refreshAccessToken throws on failure
    mockFetchFailure('Unauthorized');
    zoho.refreshAccessToken('badrefresh').then(() => {
        Logger.log('Test failed: refreshAccessToken did not throw on failure');
    }).catch(error => {
        assert(error.message.includes('Failed to refresh access token'), 'refreshAccessToken throws correct error on failure');
    });

    // Test: storeAccessToken stores token correctly
    const mockTokenData = { access_token: 'storedtoken', refresh_token: 'storedrefresh', expires_in: 3600 };
    zoho.storeRefreshToken(mockTokenData);

    const storedToken = zoho.getRefreshToken();
    assert(JSON.stringify(storedToken) === JSON.stringify(mockTokenData), 'storeAccessToken stores token correctly');
}

function test_getToken() {
     const zoho = getZohoAPI(); 
     const accessToken = zoho.getRefreshToken();
     assert(accessToken,`storeAccessToken stores token correctly: ${accessToken}` );

}

function mockUrlFetchAppSuccess(responseObj) {
    global.UrlFetchApp = {
        fetch: function(url, options) {
            return {
                getResponseCode: function() { return 200; },
                getContentText: function() { return JSON.stringify(responseObj); }
            };
        }
    };
}

function mockUrlFetchAppFailure(status, body) {
    global.UrlFetchApp = {
        fetch: function(url, options) {
            return {
                getResponseCode: function() { return status; },
                getContentText: function() { return body; }
            };
        }
    };
}

// Test for getAllCustomers
function test_getAllCustomers() {
    const zoho = new ZohoAPI({
        ...TEST_CONFIG,
        tokenEndpoint: 'https://accounts.zoho.com/oauth/v2/token'
    });

    // Mock access token retrieval
    zoho.getRefreshToken = function() { return 'mocktoken'; };

    // Success case
    const mockCustomers = { contacts: [{ contact_name: 'John Doe' }] };
    mockUrlFetchAppSuccess(mockCustomers);

    try {
        const result = zoho.getEntities('contacts', testEventFilter) ;
        assert(JSON.stringify(result) === JSON.stringify(mockCustomers), 'getAllCustomers returns correct data on success');
    } catch (e) {
        Logger.log('Test failed: getAllCustomers threw on success - ' + e.message);
    }

    // Failure case
    mockUrlFetchAppFailure(401, 'Unauthorized');
    try {
        zoho.getEntities('contacts', testEventFilter) ;
        Logger.log('Test failed: getAllCustomers did not throw on failure');
    } catch (e) {
        assert(e.message.includes('Failed to fetch customers'), 'getAllCustomers throws correct error on failure');
    }
}


