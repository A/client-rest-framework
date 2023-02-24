import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { StringField } from './StringField';

describe('StringField', () => {
  it('should have proper default option types', () => {
    const serializer = new StringField();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new StringField({ many: true, readonly: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it.each([
    { input: 42, expected: '42' },
    { input: '42', expected: '42' },
    { input: true, expected: 'true' },
  ])('should convert $input into a string', ({ input, expected }) => {
    const serializer = new StringField({ many: true, readonly: true });
    const res = serializer.fromDTO(input);
    expect(res).toEqual(expected);
  });

  it.each([
    { input: 42, expected: '42' },
    { input: '42', expected: '42' },
    { input: true, expected: 'true' },
  ])('should convert $input to DTO', ({ input, expected }) => {
    const serializer = new StringField({ many: true, readonly: true });
    const res = serializer.toDTO(input);
    expect(res).toEqual(expected);
  });
});
