/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return { ...Membership.SharedConfig,...config};
}

config = {
  version: 'SNAPSHOT-0.1.027',
  deploymentId: 'AKfycbzlHKHF6RB8g1P3NyjEMMXfpGDtT_WO2CDkb7K_nB7ybQXNj_VwjhGXirWl54RXf9r3'
}

