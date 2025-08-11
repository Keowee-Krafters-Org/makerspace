const config = {
  dev: {
    version: 'SNAPSHOT-0.2.0',
    deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
    baseUrl: 'https://script.google.com/macros/s/AKfycbyM65yuXJ-rei-tj1352ceHXtJeYbx0btXOng4ov1w/dev',
    calendarId: 'c_c9ac4bc31b22e9a6e15052c53064118f252e4e5559b82af3fe49378559fbb672@group.calendar.google.com',
    imageFolderId: '1GBamyfVCCltpLC_rB70D4unHTcJQUFdY'
  },
  prod: {
    version: 'RELEASE-0.2.5',
    deploymentId: 'AKfycbxw_iLSR_-JizgF6rzrDBMD1l-t84m0dIycKc20uA_BZQLdsiVS7NcppS72ygOSasZMuA',
    baseUrl: 'https://script.google.com/macros/s/AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR/exec',    
    calendarId: 'c_eac08aea19fae1f3f40d6cff7c2f027b28693fefca8a37381d47185a2c24fc0c@group.calendar.google.com',
    imageFolderId: '1GBamyfVCCltpLC_rB70D4unHTcJQUFdY'
  }
}

var SharedConfig = {
  mode: 'prod',
  eventHorizon: 30, // days
  upcomingClassesLimit: 10, // max number of classes to show in the upcoming classes
  upcomingClassesSort: 'start', // sort by start date
  upcomingClassesSortOrder: 'asc', // ascending order
  loginTokenExpirationMinutes: 15,
  sessionTokenExpirationMinutes: 60 * 24,
  services: {
    calendar: {
      defaultCalendarId: 'c_eac08aea19fae1f3f40d6cff7c2f027b28693fefca8a37381d47185a2c24fc0c@group.calendar.google.com'
    }
  },
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
      templateId: '1MM_WM4uJkr1y331nnpSbRXwB2zC4P2rQJUxHpobZicc',
      formId: '1zG1K0bOwW9Za9kKphNqwNirnbG0xjYdw9eRZHMmXQA4',
      destinationFolderId: '1xFChExiJhUKAiF-us5zCeZ8TNmbDbhzH',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxOIk93s3tWhT8-8_q36__YBjWE20UL7qPYBnJWE2rd2KRdw/viewform?usp=pp_url',
      entryMap: {
        firstName: 'entry.2005620554',
        lastName: 'entry.2134207864',
        emailAddress: 'entry.1045781291'
      }
    }
  },

  emailAddress: {
    admin: 'secretary@keoweekrafters.org',
    from: 'noreply@keoweekrafters.org'
  },
  levels: {
    'Guest': 0,
    'Interested Party': 1,
    'Active': 2,
    'Full Access': 3,
    'Lifetime': 4,
    'Host': 5,
    'Instructor': 6,
    'Board': 10,
    'President': 11,
    'Vice President': 12,
    'Secretary': 13,
    'Treasurer': 14,
    'Advisor': 15,
    'Administrator': 30
  },
  locations: ['Eagles Nest Arts Center,4 Eagle Lane, Salem, SC 29676',
    'Keowee Key Clubhouse, Stamp Creek Road, Salem, SC 29676'
  ],
  defaultMember: {
    id: '',
    firstName: '',
    lastName: 'Guest',
    emailAddress: '',
    registration: { status: 'NOT_REGISTERED', level: 'Guest' },
    login: { status: 'UNVERIFIED' }
  }
};

function getConfig() {
  return { ...SharedConfig, ...config[SharedConfig.mode] };
}
