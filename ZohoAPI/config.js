/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return {...config};
}

config = {
  dev: {
  version: 'SNAPSHOT-0.1.26',
  deploymentId: 'AKfycbyOY43cm2W0Mli3AVU_dSC2BuWBidLjd-OEzP6DpFj_dlzIdSp9_Sol4cXFkYzLkwpL'
  },
  prod: {
    version: 'RELEASE-1.0.2',
    deploymentId: 'AKfycbzLMvzt44a19qa8tvF4OSkDSha3y6ZN5zwVjeiWe1z8ZnLOeL58tZOxCwF-kwZ8bwHh'
  }
}

