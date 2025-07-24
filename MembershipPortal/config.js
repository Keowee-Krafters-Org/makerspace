/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */


config = {
  dev: {
    version: 'SNAPSHOT-0.2.6',
    deploymentId: 'AKfycbzyt18oWChb23EAyMnO1t22iyPUIL1vVktFrKzoOMrv2y3QO5Qwn2WVTTE9hvLQ6yDL',
    baseUrl: 'https://script.google.com/macros/s/AKfycbyM65yuXJ-rei-tj1352ceHXtJeYbx0btXOng4ov1w/dev'
  },

  prod: {
    // Production configuration
    version: 'RELEASE-0.1.11',
    deploymentId: 'AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR',
    baseUrl: 'https://script.google.com/macros/s/AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR/exec',
  }

};

function getConfig() {
  const sharedConfig = Membership.getConfig();
  const mode = sharedConfig.mode;
  const membershipVersion = sharedConfig.version;
  return { ...sharedConfig, 
    ...config[mode], 
    membershipVersion: membershipVersion };
}
