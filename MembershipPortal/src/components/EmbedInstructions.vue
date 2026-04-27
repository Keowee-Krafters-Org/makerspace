<template>
  <div class="embed-instructions p-4 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">Embed this Event</h3>
    <p class="text-sm text-gray-600 mb-4">
      Use the following URL to embed a view of just this event on a page on your website.
    </p>
    <div class="flex items-center gap-2 mb-4">
      <textarea
        ref="embedUrlInput"
        :value="embedUrl"
        readonly
        class="flex-grow p-2 border rounded bg-gray-50 text-sm font-mono"
        rows="3"
      ></textarea>
    </div>
    <h3 class="text-lg font-semibold mb-2">Event Page URL</h3>
    <p class="text-sm text-gray-600 mb-4">
      Use the following URL to link directly to the event page on your website.
    </p>
    <div class="flex items-center gap-2 mb-4">
      <textarea
        ref="pageUrlInput"
        :value="pageUrl"
        readonly
        class="flex-grow p-2 border rounded bg-gray-50 text-sm font-mono"
        rows="3"
      ></textarea>
    </div>
    <div class="instructions">
      <h4 class="font-semibold mb-2">How to embed in Google Sites:</h4>
      <ol class="list-decimal list-inside text-sm space-y-1">
        <li>Go to the page where you want to add the event.</li>
        <li>From the "Insert" menu, choose "Embed".</li>
        <li>Select the "By URL" option.</li>
        <li>Paste the copied URL into the text box and click "Insert".</li>
      </ol>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';
import Button from './Button.vue';

export default {
  name: 'EmbedInstructions',
  components: { Button },
  props: {
    event: { type: Object, required: true },
  },
  setup() {
    const session = inject('session');
    const appService = inject('appService');
    return { session, appService };
  },
  computed: {
    embedUrl() {
      const baseUrl = this.session.config?.baseUrl || '';
      if (!baseUrl) {
        return 'Configuration not loaded.';
      }
      return `${baseUrl}?view=event&id=${this.event.id}`;
    },
    pageUrl() {
      const webUrl = this.session.config?.webUrl || '';
      if (!webUrl) {
        return 'Configuration not loaded.';
      }
      const interests = this.session.config?.interests || {};
      const categoryKey = interests[this.event.eventItem?.category]?.key;
      if (!categoryKey) {
        return 'Category not found or configured.';
      }
      const url = new URL(webUrl);
      url.pathname += `classes/${categoryKey}/${this.event.id}`;
      return url.toString();
    }
  },
  methods: {
    copyUrl() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.embedUrl)
          .then(() => {
            this.appService.alert('URL copied to clipboard!');
          })
          .catch(() => {
            window.prompt('Copy this URL:', this.embedUrl);
          });
      } else {
        window.prompt('Copy this URL:', this.embedUrl);
      }
    },
  },
};
</script>
