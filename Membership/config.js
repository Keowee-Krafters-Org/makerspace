const config = {
  dev: {
    version: 'SNAPSHOT-0.2.6',
    deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
    baseUrl: 'https://script.google.com/macros/s/AKfycbyM65yuXJ-rei-tj1352ceHXtJeYbx0btXOng4ov1w/dev',
    calendarId: 'c_c9ac4bc31b22e9a6e15052c53064118f252e4e5559b82af3fe49378559fbb672@group.calendar.google.com',
    imageFolderId: '1GBamyfVCCltpLC_rB70D4unHTcJQUFdY',
    logLevel: 'DEBUG'
  },
  prod: {
    version: 'RELEASE-0.2.9',
    deploymentId: 'AKfycbxw_iLSR_-JizgF6rzrDBMD1l-t84m0dIycKc20uA_BZQLdsiVS7NcppS72ygOSasZMuA',
    baseUrl: 'https://script.google.com/macros/s/AKfycbywslFpBHt1OcsTyaE_gCRFrd3wjGhaOtbwr7mpO-hTMyyurJBM2tAiKX8cksRfmySR/exec',    
    calendarId: 'c_eac08aea19fae1f3f40d6cff7c2f027b28693fefca8a37381d47185a2c24fc0c@group.calendar.google.com',
    imageFolderId: '1GBamyfVCCltpLC_rB70D4unHTcJQUFdY',
    logLevel: 'INFO'
  }
}

var SharedConfig = {
  mode: 'dev',
  appName: 'MakerSpace Portal',
  organizationName: 'MakeKeowee',
  eventHorizon: 30, // days
  upcomingClassesLimit: 10, // max number of classes to show in the upcoming classes
  upcomingClassesSort: 'start', // sort by start date
  upcomingClassesSortOrder: 'asc', // ascending order
  loginTokenExpirationMinutes: 15,
  sessionTokenExpirationMinutes: 60 * 24,
  eventInvoiceLeadTime: 3, // days before event to make invoice payable
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
      }, 
    classRequest: {
      sheetId: '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I',
      formId: '1j1Nyv7zZyMVfe9sDe0K12e6u_A7EqKEDUV33zn4yFO4', 
      templateId: '1d8S21Ee1BMeFMo5yA8_bO-hvauvdIkSZXV-aMm5u0EA'
    }
    }
  },

  emailAddress: {
    admin: 'secretary@keoweekrafters.org',
    from: 'noreply@keoweekrafters.org'
  },
  levels: {
    'Guest': {value: 0, discount: 0},
    'Interested Party': {value: 1, discount: 0},
    'Active': {value: 2, discount: 10},
    'Full Access': {value: 3, discount: 15},
    'Lifetime': {value: 4, discount: 20},
    'Host': {value: 5, discount: 0},
    'Instructor': {value: 6, discount: 20},
    'Board': {value: 10, discount: 20},
    'President': {value: 11, discount: 20},
    'Vice President': {value: 12, discount: 20},
    'Secretary': {value: 13, discount: 20},
    'Treasurer': {value: 14, discount: 20},
    'Advisor': {value: 15, discount: 20},
    'Administrator': {value: 30, discount: 20}
  },
  interests: {
    'General ': {value: 1},
    'Arduino': {value: 2},
    'Automotive': {value: 3},
    'Blacksmithing': {value: 4},
    'Book Arts': {value: 5},
    'Ceramics': {value: 6},
    'CNC': {value: 7},
    'Coding': {value: 8},
    'Electronics': {value: 9},
    'Fabric Arts': {value: 10},
    'Food': {value: 11},
    'Furniture Making': {value: 12},
    'Gardening': {value: 13},
    'Glassworking': {value: 14},
    'Jewelry Making': {value: 15},
    'Laser Cutting': {value: 16},
    'Leatherworking': {value: 17},
    'Metalworking': {value: 18},
    'Photography': {value: 19},
    'Podcasting': {value: 20},
    'Robotics': {value: 21},
    'Video Production': {value: 22},
    'Woodworking': {value: 23},
    'Other': {value: 99}
  },
  locations: ['Eagles Nest Arts Center,4 Eagle Lane, Salem, SC 29676',
    'Keowee Key Clubhouse, Stamp Creek Road, Salem, SC 29676',
    'MakeKeowee, Woodshop - Room 203, 4 Eagle Lane, Salem, SC 29676',
    'MakeKeowee, Multipurpose - Room 204, 4 Eagle Lane, Salem, SC 29676',
    'MakeKeowee, Fabric Arts Room - Room 205, 4 Eagle Lane, Salem, SC 29676',
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

export function getConfig() {
  return { ...SharedConfig, ...config[SharedConfig.mode] };
}
