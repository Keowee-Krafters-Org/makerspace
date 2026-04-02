const common = {
  logLevel: 'INFO', // Default log level
  appName: 'MakeKeowee Portal',
  organization: {name: 'MakeKeowee', address: '4 Eagle Lane, Salem, SC 29676', phone: '864-123-4567'},
  eventHorizon: 30, // days
  upcomingClassesLimit: 10, // max number of classes to show in the upcoming classes
  upcomingClassesSort: 'start', // sort by start date
  upcomingClassesSortOrder: 'asc', // ascending order
  loginTokenExpirationMinutes: 15,
  sessionTokenExpirationMinutes: 60 * 24,
  eventInvoiceLeadTime: 3, // days before event to make invoice payable
};

module.exports = {
  Membership: {
    development: {
      ...common,
      platform: {
        name: 'gas',
        deploymentId: 'AKfycby_LA4aGgzhix8-fIzsC1w7JolfUuQZRJXNIvAkPT0ON8_1MhHNaasg7MAC3-4OF8pcFw',
      },
      version: 'SNAPSHOT-1.2.15',
      logLevel: 'DEBUG'
    },
    production: {
      ...common,
      platform: {
        name: 'gas',
        deploymentId: 'AKfycbxw_iLSR_-JizgF6rzrDBMD1l-t84m0dIycKc20uA_BZQLdsiVS7NcppS72ygOSasZMuA',
      },
      version: 'RELEASE-1.2.10',
      logLevel: 'INFO'
    },
  },
  "spond-js": {
    development: {
      ...common,
      platform: {
        name: 'gas',
        deploymentId: 'AKfycbxjR-rxzS5DbyIekcTbGbA6WinDmjBlSMEfWPjxE6ObbQLVNvyNx86fwMX2pu4BVmmL',
      },
      version: 'SNAPSHOT-0.1.0',
    },
    production: {
      ...common,
      platform: {
        name: 'gas',
        deploymentId: 'AKfycbyBxinKd-rRq3W5ggM2iH_FGe9seacTgJqjQ3N3LpGd-pIvt7hoFz8RBEjgkNAGnLUI',
      },
      version: 'RELEASE-1.1.0',
    },
  }
};
