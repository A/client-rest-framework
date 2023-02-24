import { describe, expect, it } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { BaseSerializer } from './BaseSerializer';
import { ModelSerializer } from './ModelSerializer';
import { DateField, NumberField, StringField } from './fields';

interface UserDTO {
  name: string;
  email: string;
  score: number;
  tags: string[];
  created_at: string;
}

interface User {
  name: string;
  email: string;
  score: number;
  tags: { name: string }[];
  created_at: Date;
}

interface ToDTOUserParameter {
  name: string;
  email: string;
  score: number;
  tags: { name: string }[];
}

describe('ModelSerializer', () => {
  class TagSerializer<
    R extends boolean = false,
    M extends boolean = false
  > extends BaseSerializer<R, M> {
    fromDTO = (tag: string) => ({ name: tag });
    toDTO = (tag: ReturnType<this['fromDTO']>) => tag.name;
  }

  class UserSerializer<
    R extends boolean = false,
    M extends boolean = false
  > extends ModelSerializer<UserDTO, R, M> {
    name = new StringField();
    email = new StringField();
    score = new NumberField();
    tags = new TagSerializer({ many: true });
    created_at = new DateField({ readonly: true });
  }

  it('should have proper default option types', () => {
    const serializer = new UserSerializer();
    assert<Equals<(typeof serializer)['readonly'], false>>();
    assert<Equals<(typeof serializer)['many'], false>>();
  });

  it('should properly set options as consts', () => {
    const serializer = new UserSerializer({ many: true, readonly: true });
    assert<Equals<(typeof serializer)['readonly'], true>>();
    assert<Equals<(typeof serializer)['many'], true>>();
  });

  it('should have correct return type', () => {
    const serializer = new UserSerializer({ many: true, readonly: true });
    type RetType = ReturnType<(typeof serializer)['fromDTO']>;
    assert<Equals<RetType, User>>();
  });

  it('should accept correct type in `toDTO` method', () => {
    const serializer = new UserSerializer({ many: true, readonly: true });
    type ParametersType = Parameters<(typeof serializer)['toDTO']>[0];
    assert<Equals<ParametersType, ToDTOUserParameter>>();
  });

  it('fromDTO', () => {
    const model = new UserSerializer().fromDTO({
      name: 'Anton',
      email: 'anton@anton.org',
      score: 420,
      tags: ['paid'],
      created_at: '2023-02-11T14:52:14.565Z',
    });

    expect(model).toEqual({
      name: 'Anton',
      email: 'anton@anton.org',
      score: 420,
      tags: [{ name: 'paid' }],
      created_at: new Date('2023-02-11T14:52:14.565Z'),
    });
  });

  it('toDTO', () => {
    expect(
      new UserSerializer().toDTO({
        name: 'Anton',
        email: 'anton@anton.org',
        score: '420',
        tags: [{ name: 'paid' }],
        created_at: new Date('2023-02-11T14:52:14.565Z'),
      } as any)
    ).toEqual({
      name: 'Anton',
      email: 'anton@anton.org',
      score: 420,
      tags: ['paid'],
    });
  });
});
