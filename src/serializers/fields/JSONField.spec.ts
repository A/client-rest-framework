import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { JSONField } from './JSONField';

describe('JSONField', () => {
  it('should have proper default option types', () => {
    const serializer = new JSONField<{ name: string}, false, false>();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new JSONField({ many: true, readonly: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it('should pass JSON value from DTO', () => {
    const input = { name: "anton" }
    const serializer = new JSONField<{ name: string}, true, true>({ many: true, readonly: true });
    const res = serializer.fromDTO(input);
    expect(res).toEqual({ name: "anton"});
  });

  it('should pass JSON value to DTO', () => {
    const input = { name: "anton" }
    const serializer = new JSONField<{ name: string}, true, true>({ many: true, readonly: true });
    const res = serializer.toDTO(input);
    expect(res).toEqual({ name: "anton"});
  });
});
