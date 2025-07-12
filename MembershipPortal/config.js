/**
 * Provides the SharedConfig object to the client-side web app.
 * This function acts as a secure relay to expose necessary configuration
 * such as form URLs and entry mappings, while keeping the config centralized. See: Membership.config project
 */


config = {
  version: 'SNAPSHOT-0.0.10', 
  deploymentId: 'AKfycbzyt18oWChb23EAyMnO1t22iyPUIL1vVktFrKzoOMrv2y3QO5Qwn2WVTTE9hvLQ6yDL',
  mode:'prod',
  modes: {
    dev: {
      baseUrl: 'https://script.google.com/macros/s/AKfycbyM65yuXJ-rei-tj1352ceHXtJeYbx0btXOng4ov1w/dev',
    },
    prod: {
      baseUrl: 'https://script.google.com/macros/s/AKfycbzyt18oWChb23EAyMnO1t22iyPUIL1vVktFrKzoOMrv2y3QO5Qwn2WVTTE9hvLQ6yDL/exec',
    }
  }
};

function getConfig() {
  return {...Membership.SharedConfig, ...config, baseUrl: config.modes[config.mode].baseUrl};
}
