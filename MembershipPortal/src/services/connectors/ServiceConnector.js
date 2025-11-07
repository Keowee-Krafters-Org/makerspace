export class ServiceConnector {
  // Implementors must override invoke(fnName, ...args): Promise<any>
  async invoke(_fnName, ..._args) {
    throw new Error('ServiceConnector.invoke not implemented');
  }

  // Deployment environment hint: 'gas' | 'web' | 'node' | 'unknown'
  getDeploymentEnvironment() {
    return 'unknown';
  }
}