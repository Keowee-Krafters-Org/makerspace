/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */


config = {
  dev: {
    version: 'SNAPSHOT-0.1.102',
    deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
  },
  prod: {
    // Production configuration
    // This is the configuration used in the live environment
    // It should be updated with the latest stable version and deployment ID
    // Ensure to update this when deploying new changes
    // Example:
    // deploymentId: 'AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR',
    // Note: The deploymentId should be the one from the latest deployment
    // This is a placeholder and should be replaced
    // with the actual deployment ID after deployment
    version: 'RELEASE-1.0.7',
    deploymentId: 'AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR',
  }

};


