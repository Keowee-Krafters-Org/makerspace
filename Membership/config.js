const config = {
  version: 'SNAPSHOT-..13',
  deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
}

var SharedConfig = {
  ...config,
  loginTokenExpirationMinutes: 15,
  sesstionTokenExpirationMinutes: 60 * 24,
  forms: {
    registration: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScEGclpyk12DVBPD3chZq1Xuds1NXEPwlRZopvb8tbN5NR3FQ/viewform?usp=pp_url',
      entryMap: {
        emailAddress: 'entry.538564402',
        firstName: 'entry.2005620554',
        lastName: 'entry.591981780'
      }
    },
    volunteer: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScfWZFT5WGT2mAyMV9eYKric0weuLuqNuzwizrDKU8DY3USQw/viewform?usp=pp_url',
      entryMap: {
        emailAddress: 'entry.264092496',
        name: 'entry.640888911'
      }
    },
    waiver: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxOIk93s3tWhT8-8_q36__YBjWE20UL7qPYBnJWE2rd2KRdw/viewform?usp=pp_url',
      entryMap: {
        firstName: 'entry.2005620554',
        lastName: 'entry.2134207864',
        emailAddress: 'entry.1045781291'
      }
    }
  },
  registry: {
    sheet: {
      id: '1VOY4Xv8wqn0P0SjeGX1612c0uMmgJxH4NHItY4pLHUM',
      name: 'Member Registry',
      namedColumns: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress',
        level: 'level',
        waiverDate: 'waiverDate',
        waiverPdfLink: 'waiverPdfLink'
      },
      emailLookupColumn: 'emailAddress'
    }
  },
  classes_deprecated: {
    sheet: {
      id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
      name: 'Class List',
      namedColumns: {
        title: 'ClassTitle',
        description: 'Description'
      }
    }
  },
  events_deprecated: {
    sheet: {
      id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
      name: 'Event List',
      namedColumns: {
        title: 'EventTitle',
        description: 'Description',
        date: 'EventDate',
        host: 'Host',
        location: 'Location',
        sizeLimit: 'SizeLimit'
      }
    }
  },
  members: {
    name: 'contacts', 
    fieldMap: {
      id: 'contact_id',
      waiverPdfLink: 'cf_waiver_pdf_link',
      waiverDate: 'cf_waiver_date',
      level: 'cf_membership_level',
      interests: 'cf_interests',
      status: 'cf_status',
      memberStatus: 'cf_member_status',
      authenication: 'cf_authentication',
      waiverSigned: 'cf_waiver_signed',
      registrationStatus: 'cf_registration_status',
      isMember: 'cf_is_member',
    }
  },
  events: {
    name: 'items',
    fieldMap: {
      eventId: 'cf_event_id',
      title: 'cf_event_title',
      description: 'cf_event_description',
      date: 'cf_scheduled_date',
      duration: 'cf_duration_hrs',
      host: 'cf_event_host',
      level: 'cf_experience_level',
      location: 'cf_location',
      sizeLimit: 'cf_attendance_limit',
      attendees: 'cf_event_attendees'
    }
  },
  eventSignups: {
    sheet: {
      id: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
      name: 'Event Signups',
      namedColumns: {
        eventId: 'EventId',
        attendeeName: 'AttendeeName',
        attendeeEmail: 'AttendeeEmail'
      }
    }
  },
  tests: {
    sheet: {
      id: '1bQ_kTLamrx7PUlvKxyhvhFYypNy_bLgqmKysH0QdC0o',
      name: 'Test Data',
      namedColumns: {
        id: 'id',
        title: 'title',
        timestamp: 'timestamp',
        complete: 'complete',
      }
    }
  },
  emailAddress: {
    admin: 'secretary@keoweekrafters.org',
    from: 'noreply@keoweekrafters.org'
  },
  levels: {
    1: 'Interested Party',
    2: 'Active Member',
    3: 'Lifetime Member',
    4: 'Instructor',
    5: 'Workshop Supervisor',
    10: 'BOD Member',
    11: 'President',
    12: 'Vice President',
    13: 'Secretary',
    14: 'Treasurer',
    15: 'Advisor',
    30: 'Administrator'
  }
};

