var SharedConfig = {
  version: 'SNAPSHOT-0.1.22',
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

  emailAddress: {
    admin: 'secretary@keoweekrafters.org',
    from: 'noreply@keoweekrafters.org'
  },

  levels: {
    1: 'Interested Party',
    2: 'Active Member',
    3: 'Lifetime Member',
    4: 'Instructor',
    5: 'Workshop Supervisor' ,
    10: 'BOD Member',
    11: 'President', 
    12: 'Vice President',
    13: 'Secretary',
    14: 'Treasurer',
    15: 'Advisor',
    30: 'Administrator'
  }
};
