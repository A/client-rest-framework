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
  phone: string | null;
  score: number;
  tags: { name: string }[];
  tags_optional: { name: string }[] | null;
  created_at: Date;
}

interface ToDTOUserParameter {
  name: string;
  email: string;
  score: number;
  tags: { name: string }[];
  tags_optional: { name: string }[] | null | undefined;
  phone: string | null | undefined;
}

describe('ModelSerializer', () => {
  class TagSerializer<
    R extends boolean = false,
    M extends boolean = false,
    O extends boolean = false
  > extends BaseSerializer<R, M, O> {
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
    tags_optional = new TagSerializer({ many: true, optional: true });
    phone = new StringField({ optional: true });
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

  it('should return correct optional response', () => {
    const serializer = new class TestSerializer extends ModelSerializer {
      opt_string = new StringField({ optional: true });
      opt_number = new NumberField({ optional: true });
      opt_array = new StringField({ many: true, optional: true });

    };
    const data = serializer.fromDTO({
      opt_string: null,
      opt_number: null,
      opt_array: null
    })
    expect(data).toEqual({
      opt_string: null,
      opt_number: null,
      opt_array: null
    })
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
