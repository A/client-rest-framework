import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { BooleanField } from './BooleanField';

describe('BooleanField', () => {
  it('should have proper default option types', () => {
    const serializer = new BooleanField();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new BooleanField({
      many: true,
      readonly: true,
      optional: true,
    });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
    assert<Equals<(typeof serializer)['optional'], true>>();
  });

  it.each([
    { input: true, expected: true },
    { input: 'false', expected: true },
    { input: 0, expected: false },
  ])('should convert $input into a boolean', ({ input, expected }) => {
    const serializer = new BooleanField({ many: true, readonly: true });
    const res = serializer.fromDTO(input);
    expect(res).toEqual(expected);
  });

  it.each([
    { input: true, expected: true },
    { input: 1, expected: true },
    { input: '', expected: false },
  ])('should convert $input to DTO', ({ input, expected }) => {
    const serializer = new BooleanField({ many: true, readonly: true });
    const res = serializer.toDTO(input);
    expect(res).toEqual(expected);
  });
});
