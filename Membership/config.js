const config = {
  dev: {
    version: 'SNAPSHOT-0.2.26',
    deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
    baseUrl: 'https://script.google.com/macros/s/AKfycbyM65yuXJ-rei-tj1352ceHXtJeYbx0btXOng4ov1w/dev',
    calendarId: 'c_c9ac4bc31b22e9a6e15052c53064118f252e4e5559b82af3fe49378559fbb672@group.calendar.google.com',
    imageFolderId: '1GBamyfVCCltpLC_rB70D4unHTcJQUFdY',
    logLevel: 'DEBUG'
  },
  prod: {
    version: 'RELEASE-1.0.4',
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
  organization: {name: 'MakeKeowee'},
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
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxOIk93s3tWhT8-8_q36__YBjWE20UL7qPYBnJWE2rd2KRdw/viewform?usp=pp_url&embedded=true',
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
  rateSheetLink: 'https://docs.google.com/document/d/1RfYLXGWOJJRczam1bWBvPyVoabifQWtsMxjqARHeKyU/edit?usp=sharing',
  levels: {
    'Guest': {value: 0, discount: 0, description: 'Guest - Not a member', itemId: ''},
    'Interested Party': {value: 1, discount: 0  , description: 'Interested Party - Not a member', itemId: '5636475000001511102'    },
    'Active': {value: 2, discount: 10 , description: 'Active Member - Access to most tools and classes', itemId: '5636475000000148799'},
    'Full Access': {value: 3, discount: 15 , description: 'Full Access Member - Access to all tools and workshops', itemId: '5636475000001511056'},
    'Lifetime': {value: 4, discount: 20, description: 'Lifetime Member - Full access for life', itemId: '' },
    'Host': {value: 5, discount: 25, description: 'Host Member - Full access plus ability to host classes and events', itemId: ''  },
    'Instructor': {value: 6, discount: 20, description: 'Instructor Member - Full access plus ability to teach classes', itemId: ''    },
    'Board': {value: 10, discount: 20, description: 'Board Member - Full access plus ability to vote in board elections', itemId: ''      },
    'President': {value: 11, discount: 20, description: 'President - Full access plus ability to lead the board', itemId: ''          },
    'Vice President': {value: 12, discount: 20, description: 'Vice President - Full access plus ability to assist the President', itemId: ''},
    'Secretary': {value: 13, discount: 20, description: 'Secretary - Full access plus ability to manage records', itemId: ''},
    'Treasurer': {value: 14, discount: 20, description: 'Treasurer - Full access plus ability to manage finances', itemId: ''},
    'Advisor': {value: 15, discount: 20, description: 'Advisor - Full access plus ability to provide guidance', itemId: ''},
    'Administrator': {value: 30, discount: 20, description: 'Administrator - Full access with administrative privileges', itemId: ''}
  },
  interests: {
    'General Arts and Crafts': {value: 1},
    'Fabric Arts': {value: 2},
    'Woodworking': {value: 3},
    'Painting': {value: 4},
    'Paper Crafts': {value:   6},
    '3D Printing': {value: 7},
    '2D Cutting/Engraving': {value: 8},
    'Jewelry': {value: 9},
    'Pottery and Ceramics': {value: 10},
    'Metalwork': {value: 11},
    'Wood Turning': {value: 12},
    'Glassworking': {value: 13},
    'Leatherworking': {value: 16},
    'Photography': {value: 18},
    'Robotics': {value: 19},
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
