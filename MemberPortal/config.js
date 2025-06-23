/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return {...Membership.SharedConfig, ...config};
}

config = {
  version: 'SNAPSHOT-0.1.58',
  deploymentId: 'AKfycbzu3_5bzUEXaoqYMjczvq3BFLIxoYB4z7stAzu5qIk3L2MWbdTi09wsao3IVg6HoKV5'
}

