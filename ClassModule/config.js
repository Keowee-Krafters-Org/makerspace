/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return {...Membership.SharedConfig, ...config};
}

config = {
  version: 'RELEASE-0.1.0',
  deploymentId: 'AKfycbzwTVe63Kz-WoJGiwLPr79hNAfJsVFogpluFVbu-9VSRn8fSBuSRG7QZGX-WhxPCUHGNg'
}

