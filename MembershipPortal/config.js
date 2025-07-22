/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */


config = {
  dev: {
    version: 'SNAPSHOT-0.2.3',
    deploymentId: 'AKfycbzyt18oWChb23EAyMnO1t22iyPUIL1vVktFrKzoOMrv2y3QO5Qwn2WVTTE9hvLQ6yDL'
  },
  prod: {
    // Production configuration
    version: 'RELEASE-0.1.6',
    deploymentId: 'AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR'
  }

};

function getConfig() {
  const mode = Membership.getConfig().mode;
  return { ...Membership.getConfig(), ...config[mode] };
}
