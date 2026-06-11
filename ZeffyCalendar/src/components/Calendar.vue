<template>
  <div class="max-w-full">
    <h2 class="text-xl font-semibold mb-4 text-center">Event Calendar</h2>
    <div class="p-4 bg-white rounded-lg shadow-lg">
      <div v-if="isLoading" class="text-center py-8 text-gray-500">Loading...</div>
      <div v-if="error" class="text-center text-red-500">{{ error }}</div>
      <v-calendar v-if="!isLoading && !error" :attributes="attributes" expanded borderless @dayclick="onDayClick"></v-calendar>
    </div>

    <!-- Event cards for selected day -->
    <div v-if="selectedDayEvents.length" class="mt-6">
      <h3 class="text-lg font-bold mb-3">Classes on {{ selectedDay }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="event in selectedDayEvents"
          :key="event.key"
          class="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
          <!-- Thumbnail -->
          <a :href="event.customData.url" target="_blank" rel="noopener noreferrer">
            <img
              v-if="event.customData.imageUrl"
              :src="event.customData.imageUrl"
              :alt="event.customData.title"
              class="w-full h-40 object-cover"
            />
            <div v-else class="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          </a>

          <!-- Content -->
          <div class="p-4 flex flex-col flex-1">
            <a
              :href="event.customData.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base font-semibold text-blue-700 hover:underline leading-snug mb-1"
            >
              {{ event.customData.title }}
            </a>
            <p v-if="event.customData.startTime" class="text-xs text-gray-500 mb-2">
              {{ event.customData.startTime }}
            </p>
            <p class="text-sm text-gray-600 flex-1 line-clamp-3">{{ event.customData.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No events placeholder -->
    <div v-else-if="selectedDay" class="mt-6 text-center text-gray-400 text-sm">
      No classes scheduled for {{ selectedDay }}.
    </div>
  </div>
</template>


<script>
import { inject } from 'vue';

export default {
  name: 'Calendar',
  data() {
    return {
      attributes: [],
      selectedDayEvents: [],
      selectedDay: null,
      eventService: null,
      isLoading: false,
      error: null,
    };
  },
  created() {
    this.eventService = inject('eventService');
    this.loadEvents();
  },
  methods: {
    loadEvents() {
      this.eventService.getEvents()
        .then(response => {
          if (response && Array.isArray(response.data)) {
            this.attributes = response.data.map(event => ({
              key: event.id,
              highlight: true,
              dates: new Date(event.start_date),
              customData: {
                title: event.name || event.title,
                description: event.description,
                url: event.public_url || event.url,
                imageUrl: event.banner_url || event.logo_url || event.imageUrl || null,
                startTime: event.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
              },
              popover: {
                label: event.name || event.title,
              }
            }));
          } else {
            console.error("Invalid data structure from getEvents", response);
            this.attributes = [];
          }
        })
        .catch(error => {
          this.error = 'Failed to load events.';
          this.attributes = [];
        });
    },
    onDayClick(day) {
      this.selectedDay = day.date.toLocaleDateString();
      this.selectedDayEvents = this.attributes.filter(attr => 
        new Date(attr.dates).toDateString() === day.date.toDateString()
      );
    },
  },
};
</script>