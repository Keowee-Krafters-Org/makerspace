export class ServiceConnector {
  // Implementors must override invoke(fnName, ...args): Promise<any>
  async invoke(_fnName, ..._args) {
    throw new Error('ServiceConnector.invoke not implemented');
  }
}