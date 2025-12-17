export function getConfig() {
  return { ...SharedConfig, ...config[SharedConfig.mode] };
}