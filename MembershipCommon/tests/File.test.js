import { describe, it, expect } from 'vitest';
import { File } from '@/model/File';

describe('File', () => {
  it('should instantiate a new file object', () => {
    const file = new File();
    expect(file).toBeInstanceOf(File);
  });
});
