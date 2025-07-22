/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return { ...Membership.SharedConfig,...config};
}

config = {
  dev: {
  version: 'SNAPSHOT-0.1.027',
  deploymentId: 'AKfycbzlHKHF6RB8g1P3NyjEMMXfpGDtT_WO2CDkb7K_nB7ybQXNj_VwjhGXirWl54RXf9r3'
  },
  prod: {
    version: 'RELEASE-0.1.2',
    deploymentId: 'AKfycbwGddph4Surb2_mZyihdymZpYLT8wdIfvX6afzSK4p-xp8dHxeRd6JA9MoCbWDJJtXW'
  }
}

