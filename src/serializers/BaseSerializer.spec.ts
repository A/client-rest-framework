import { describe, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { BaseSerializer } from './BaseSerializer';

describe('BaseSerializer', () => {
  it('should have proper default option types', () => {
    const serializer = new BaseSerializer();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
    assert<Equals<(typeof serializer)['optional'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new BaseSerializer({ many: true, readonly: true, optional: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
    assert<Equals<(typeof serializer)['optional'], true>>();
  });
});
