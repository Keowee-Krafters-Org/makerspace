<template>
  <div id="app">
    <header class="bg-blue-500 text-white p-4">
      <h1 class="text-xl font-bold">Membership Portal</h1>
    </header>
    <main class="p-4">
      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>
      <div v-else>
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { PortalManager } from './PortalManager.js';

export default {
  name: 'App',

  data() {
    return {
      portalManager: null, // Store the PortalManager instance
      logger: null, // Store the logger instance
      session: null, // Store the session instance
      memberPortal: null, // Store the MemberPortal instance
      adminPortal: null, // Store the AdminPortal instance
      loading: true, // Add a loading state
      member: null, // Store member data if needed
    };
  },

   created() {
    // Initialize the PortalManager
    this.loading = false; // Set loading to false once initialization is complete
  },

  provide() {
    // Provide dependencies to child components
    
    const portalManager = new PortalManager();
    portalManager.initialize(); // Wait for initialization to complete
    this.portalManager = portalManager; // Store the initialized PortalManager
    this.logger = portalManager.logger; // Store the logger instance
    this.session = portalManager.getSession(); // Store the session instance
    this.memberPortal = portalManager.portals.member; // Store the MemberPortal instance
    this.adminPortal = portalManager.portals.admin; // Store the AdminPortal instance
    this.member = this.session.member; // Store member data if needed
    return {  
      portalManager: this.portalManager, // Provide PortalManager 
      logger:  this.logger, // Provide logger 
      session: this.session, // Provide session
      memberPortal:  this.memberPortal, // Provide MemberPortal
      adminPortal: this.adminPortal, // Provide AdminPortal
      member: this.member, // Provide member data
    };
  },
};
</script>

<style scoped>
/* Add any additional styles here */
</style>