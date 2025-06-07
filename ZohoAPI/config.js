/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */
function getConfig() {
  return {...config};
}

config = {
  version: 'SNAPSHOT-0.1.4',
  deploymentId: 'AKfycbyOY43cm2W0Mli3AVU_dSC2BuWBidLjd-OEzP6DpFj_dlzIdSp9_Sol4cXFkYzLkwpL'
}

