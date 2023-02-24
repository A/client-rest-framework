import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { DateField } from './DateField';

describe('DataField', () => {
  it('should have proper default option types', () => {
    const serializer = new DateField();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new DateField({ many: true, readonly: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it.each([
    {
      input: '2023-02-11T14:52:14.565624Z',
      expected: new Date('2023-02-11T14:52:14.565624Z'),
    },
  ])('should convert $input into a date-object', ({ input, expected }) => {
    const serializer = new DateField({ many: true, readonly: true });
    const res = serializer.fromDTO(input);
    expect(res).toEqual(expected);
  });

  it.each([
    {
      input: new Date('2023-02-11T14:52:14.565624Z'),
      expected: '2023-02-11T14:52:14.565Z',
    },
  ])('should convert $input to DTO', ({ input, expected }) => {
    const serializer = new DateField({ many: true, readonly: true });
    const res = serializer.toDTO(input);
    expect(res).toEqual(expected);
  });
});
