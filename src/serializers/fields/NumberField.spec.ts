import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { NumberField } from './NumberField';

describe('NumberField', () => {
  it('should have proper default option types', () => {
    const serializer = new NumberField();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new NumberField({ many: true, readonly: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it.each([
    { input: 42, expected: 42 },
    { input: '42', expected: 42 },
    { input: true, expected: 1 },
  ])('should convert $input into a number', ({ input, expected }) => {
    const serializer = new NumberField({ many: true, readonly: true });
    const res = serializer.fromDTO(input);
    expect(res).toEqual(expected);
  });

  it.each([
    { input: 42, expected: 42 },
    { input: '42', expected: 42 },
    { input: true, expected: 1 },
  ])('should convert $input into a DTO', ({ input, expected }) => {
    const serializer = new NumberField({ many: true, readonly: true });
    const res = serializer.toDTO(input);
    expect(res).toEqual(expected);
  });
});
