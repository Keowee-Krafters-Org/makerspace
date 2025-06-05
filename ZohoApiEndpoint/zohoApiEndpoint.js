
function doGet(e) {
    const zohoAPI = ZohoAPI.getZohoAPI();
    if (e && e.parameter && e.parameter.code) {
        const authCode = e.parameter.code;

        zohoAPI.exchangeCodeForToken(authCode)
            .then(response => {
                return ContentService.createTextOutput(JSON.stringify({
                    status: 'success',
                    data: response
                }));
            })
            .catch(error => {
                return ContentService.createTextOutput(JSON.stringify({
                    status: 'error',
                    message: error.message
                }));
            });
    } else {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: 'Authorization code not provided'
        }));
    }
   return HtmlService.createHtmlOutput("Authorization received. You may close this window.");
}
