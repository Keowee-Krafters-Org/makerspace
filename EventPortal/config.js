/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return JSON.stringify({...Membership.SharedConfig, ...config});
}

config = {
  version: 'SNAPSHOT-0.1.25',
  deploymentId: 'AKfycbxJ-RojAvSwumV8Gebs-0yA6jK_DLPFobfeZOy8ChvD5YBaaQDTp6Zv54vtg2e9NEjPPQ'
}

