import { describe, it, expect } from 'vitest';
import { Entity } from '@/model/Entity';

describe('Entity', () => {
  it('should instantiate a new entity object', () => {
    const entity = new Entity();
    expect(entity).toBeInstanceOf(Entity);
  });
});
