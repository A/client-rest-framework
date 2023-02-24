import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { EnumField } from './EnumField';

type T = 'a' | 'b' | 'c';

describe('EnumField', () => {
  it('should have proper default option types', () => {
    const serializer = new EnumField<T>();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    // NOTE: TS can't infer generics after a required one, therefore for EnumField
    //       you have to pass many/readonly generic values explicitly
    const serializer = new EnumField<T, true, true>({
      many: true,
      readonly: true,
    });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it.each([{ input: 'a', expected: 'a' }])(
    'should convert $input into a enum',
    ({ input, expected }) => {
      const serializer = new EnumField<T, true, true>({
        many: true,
        readonly: true,
      });
      const res = serializer.fromDTO(input);
      expect(res).toEqual(expected);
      assert<Equals<typeof res, T>>();
    }
  );

  it.each([{ input: 'a', expected: 'a' }])(
    'should convert $input into a DTO',
    ({ input, expected }) => {
      const serializer = new EnumField<T, true, true>({
        many: true,
        readonly: true,
      });
      const res = serializer.toDTO(input);
      expect(res).toEqual(expected);
      assert<Equals<typeof res, T>>();
    }
  );
});
