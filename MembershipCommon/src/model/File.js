import { Entity } from './Entity.js';

/**
 * DriveFile implements File interface
 */
export class File extends Entity{
  constructor(data = {}) {
    super(data);
  }
}
