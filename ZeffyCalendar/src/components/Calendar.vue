<template>
  <div class="max-w-full">
    <h2 class="text-xl font-semibold mb-4 text-center">Class Calendar</h2>
    <div class="p-4 bg-white rounded-lg shadow-lg">
      <div v-if="isLoading" class="text-center py-8 text-gray-500">Loading classes...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <FullCalendar v-else :options="calendarOptions">
        <template #eventContent="arg">
          <div v-if="!arg.view.type.startsWith('list')" class="min-w-0 leading-tight">
            <a
              v-if="arg.event.extendedProps.url"
              :href="arg.event.extendedProps.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[13px] font-bold sm:text-[11px] sm:font-semibold leading-tight truncate text-slate-900 hover:underline block"
              :class="{ 'mobile-vertical-title': shouldUseVerticalTitle(arg.view.type) }"
              @click.stop
            >
              {{ arg.event.title }}
            </a>
            <div
              v-else
              class="text-[13px] font-bold sm:text-[11px] sm:font-semibold leading-tight truncate text-slate-900"
              :class="{ 'mobile-vertical-title': shouldUseVerticalTitle(arg.view.type) }"
            >
              {{ arg.event.title }}
            </div>
            <div
              v-if="arg.timeText"
              class="text-[10px] text-slate-700 truncate"
              :class="{ 'mobile-hide-time': shouldUseVerticalTitle(arg.view.type) }"
            >
              {{ arg.timeText }}
            </div>
          </div>
          <div v-else class="min-w-0">
            <a
              v-if="arg.event.extendedProps.url"
              :href="arg.event.extendedProps.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[13px] font-bold sm:text-[11px] sm:font-semibold leading-tight truncate text-slate-900 hover:underline block"
              @click.stop
            >
              {{ arg.event.title }}
            </a>
            <div v-else class="text-[13px] font-bold sm:text-[11px] sm:font-semibold leading-tight truncate text-slate-900">
              {{ arg.event.title }}
            </div>
          </div>
        </template>
      </FullCalendar>
    </div>

    <div v-if="selectedEvent" class="mt-6 bg-white rounded-xl shadow overflow-hidden">
      <img
        v-if="selectedEvent.extendedProps.imageUrl"
        :src="selectedEvent.extendedProps.imageUrl"
        :alt="selectedEvent.title"
        class="w-full h-52 object-cover"
      />
      <div class="p-5">
        <a
          :href="selectedEvent.extendedProps.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-lg font-bold text-blue-700 hover:underline"
        >
          {{ selectedEvent.title }}
        </a>
        <p class="text-sm text-gray-500 mt-1">{{ selectedEvent.extendedProps.startLabel }}</p>
        <p v-if="selectedEvent.extendedProps.durationLabel" class="text-sm text-gray-500">
          Duration: {{ selectedEvent.extendedProps.durationLabel }}
        </p>
        <p class="text-sm text-gray-700 mt-3">{{ selectedEvent.extendedProps.description }}</p>
      </div>
    </div>
  </div>
</template>


<script>
import { inject } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export default {
  name: 'Calendar',
  components: {
    FullCalendar,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        timeZone: 'local',
        defaultAllDay: false,
        allDaySlot: false,
        eventBackgroundColor: '#dbeafe',
        eventBorderColor: '#93c5fd',
        eventTextColor: '#0f172a',
        displayEventTime: true,
        eventTimeFormat: {
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        },
        forceEventDuration: true,
        defaultTimedEventDuration: '01:00',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        nowIndicator: true,
        height: 'auto',
        events: [],
        eventDataTransform: eventData => ({
          ...eventData,
          allDay: false,
        }),
        eventClick: this.onEventClick,
      },
      selectedEvent: null,
      eventService: null,
      isNarrowViewport: false,
      isLoading: false,
      error: null,
    };
  },
  created() {
    this.eventService = inject('eventService');
    this.updateViewportMode();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.updateViewportMode);
    }
    this.loadEvents();
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.updateViewportMode);
    }
  },
  methods: {
    updateViewportMode() {
      if (typeof window === 'undefined') {
        this.isNarrowViewport = false;
        return;
      }
      this.isNarrowViewport = window.innerWidth <= 900;
    },

    shouldUseVerticalTitle(viewType) {
      return this.isNarrowViewport && ['dayGridMonth', 'timeGridWeek'].includes(viewType);
    },

    parseDate(value) {
      if (!value) {
        return null;
      }
      const parsed = value instanceof Date ? value : new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    },

    formatDuration(minutes) {
      const totalMinutes = Number(minutes);
      if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
        return '';
      }

      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
      }
      if (hours > 0) {
        return `${hours}h`;
      }
      return `${mins}m`;
    },

    normalizeDurationMinutes(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        return 0;
      }

      // Guard against second-based values leaking through (e.g. 7200 => 120m).
      if (numeric > 1440) {
        return Math.max(1, Math.round(numeric / 60));
      }

      return Math.round(numeric);
    },

    computeDurationMinutes(start, end, fallbackDuration = 0) {
      if (start instanceof Date && end instanceof Date && end.getTime() >= start.getTime()) {
        return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
      }
      return this.normalizeDurationMinutes(fallbackDuration);
    },

    isArchivedOccurrence(occurrence) {
      if (!occurrence || typeof occurrence !== 'object') {
        return false;
      }

      const flag = occurrence.is_archived ?? occurrence.isArchived;
      if (typeof flag === 'string') {
        return flag.toLowerCase() === 'true';
      }
      return flag === true;
    },

    buildCalendarEvent(baseEvent, start, end, idSuffix = '') {
      const durationMinutes = this.computeDurationMinutes(start, end, baseEvent.duration);
      const safeEnd = end || (start && durationMinutes > 0
        ? new Date(start.getTime() + durationMinutes * 60000)
        : null);

      return {
        id: String(baseEvent.id || `${baseEvent.title}-${start ? start.getTime() : Date.now()}`) + idSuffix,
        title: baseEvent.title || 'Untitled Class',
        start,
        allDay: false,
        end: safeEnd || start,
        extendedProps: {
          url: baseEvent.url || '',
          imageUrl: baseEvent.imageUrl || null,
          description: baseEvent.description || '',
          isRecurring: !!baseEvent.isRecurring,
          recurrence: Array.isArray(baseEvent.recurrence) ? baseEvent.recurrence : [],
          durationMinutes,
          durationLabel: this.formatDuration(durationMinutes),
          startLabel: start ? start.toLocaleString() : '',
        },
      };
    },

    toCalendarEvents(event) {
      const recurrence = Array.isArray(event.recurrence) ? event.recurrence : [];
      const occurrenceEvents = recurrence
        .map((occurrence, index) => {
          if (this.isArchivedOccurrence(occurrence)) {
            return null;
          }

          const occurrenceStart = this.parseDate(
            occurrence && (occurrence.startDate || occurrence.start || occurrence.start_date),
          );
          const occurrenceEnd = this.parseDate(
            occurrence && (occurrence.endDate || occurrence.end || occurrence.end_date),
          );
          if (!(occurrenceStart instanceof Date) || Number.isNaN(occurrenceStart.getTime())) {
            return null;
          }
          return this.buildCalendarEvent(event, occurrenceStart, occurrenceEnd, `-occ-${index}`);
        })
        .filter(item => item && item.start instanceof Date && !Number.isNaN(item.start.getTime()));

      if (occurrenceEvents.length > 0) {
        return occurrenceEvents;
      }

      const start = this.parseDate(event.startDate);
      const end = this.parseDate(event.endDate);
      if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
        return [];
      }

      return [this.buildCalendarEvent(event, start, end)];
    },
    loadEvents() {
      this.isLoading = true;
      this.error = null;
      this.eventService.getEvents()
        .then(response => {
          if (response && Array.isArray(response.data)) {
            const events = response.data
              .flatMap(event => this.toCalendarEvents(event))
              .filter(event => event.start instanceof Date && !Number.isNaN(event.start.getTime()));
            this.calendarOptions.events = events;
          } else {
            this.calendarOptions.events = [];
            this.error = 'No class data returned.';
          }
        })
        .catch(() => {
          this.error = 'Failed to load events.';
          this.calendarOptions.events = [];
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    onEventClick(info) {
      this.selectedEvent = info.event;
      if (info.event.extendedProps && info.event.extendedProps.url) {
        window.open(info.event.extendedProps.url, '_blank', 'noopener,noreferrer');
      }
    },
  },
};
</script>

<style scoped>
:deep(.mobile-vertical-title) {
  writing-mode: vertical-rl !important;
  text-orientation: upright !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  letter-spacing: -0.02em !important;
  line-height: 1 !important;
  font-size: 11px !important;
  max-height: 72px !important;
}

:deep(.mobile-hide-time) {
  display: none !important;
}

:deep(.fc .fc-daygrid-event .fc-event-main) {
  overflow: visible;
}
</style>