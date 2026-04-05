import { File } from '../../../models/File.js';

/**
 * DriveFile implements File interface
 */
export class DriveFile extends File{
  constructor(data = {}) {
    super(data); 
  }
}