import { describe, expect, it, jest } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { repositories, serializers } from '..';
import { pagination } from '..';
import { RESTAPI } from '../api';

const USER = {
  name: 'Anton',
  email: 'anton@anton.org',
  created_at: '2023-02-11T14:52:14.565Z',
};

interface UserDTO {
  name: string;
  email: string;
  created_at: string;
}

interface User {
  name: string;
  email: string;
  score: number;
  created_at: Date;
}

interface UserToDTO {
  name: string;
  email: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class HTTPClient {
  get = jest.fn(async () => {
    await sleep(20);
    return { data: USER };
  });
  post = jest.fn(async () => {
    await sleep(20);
    return { data: USER };
  });
  patch = jest.fn(async () => {
    await sleep(20);
    return { data: USER };
  });
  delete = jest.fn(async () => {
    await sleep(20);
    return;
  });
}

const client = new HTTPClient();

class API<DTO> extends RESTAPI<DTO> {
  pagination = new pagination.PageNumberPagination<DTO>();
  client = client;
}

describe('Repositories', () => {
  class UserSerializer<
    R extends boolean = false,
    M extends boolean = false
  > extends serializers.ModelSerializer<UserDTO, R, M> {
    name = new serializers.StringField();
    email = new serializers.StringField();
    score = new serializers.NumberField({ readonly: true });
    created_at = new serializers.DateField({ readonly: true });
  }

  const api = new API<UserDTO>();
  class UserRepository extends repositories.APIRepository {
    api = api;
    serializer = new UserSerializer();
  }

  describe('Types', () => {
    it('`repo.get` should return parsed model', () => {
      const repo = new UserRepository();
      type GetReturnType = Awaited<ReturnType<(typeof repo)['get']>>;
      assert<Equals<GetReturnType, User>>();
    });

    it('`repo.create` should return parsed model', () => {
      const repo = new UserRepository();
      type CreateReturnType = Awaited<ReturnType<(typeof repo)['create']>>;
      assert<Equals<CreateReturnType, User>>();
    });

    it('`repo.create` should accept correct argument', () => {
      const repo = new UserRepository();
      type CreateArgument = Parameters<(typeof repo)['create']>[0];
      assert<Equals<CreateArgument, UserToDTO>>();
    });

    it('`repo.update` should return parsed model', () => {
      const repo = new UserRepository();
      type UpdateReturnType = Awaited<ReturnType<(typeof repo)['update']>>;
      assert<Equals<UpdateReturnType, User>>();
    });

    it('`repo.update` should accept correct argument', () => {
      const repo = new UserRepository();
      type ID = Parameters<(typeof repo)['update']>[0];
      type UpdateArgument = Parameters<(typeof repo)['update']>[1];
      assert<Equals<ID, number | string>>();
      assert<Equals<UpdateArgument, Partial<UserToDTO>>>();
    });

    it('`repo.list` should return paginated parsed model', async () => {
      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: { results: [USER], count: 1 } } as any;
      });

      const repo = new UserRepository();
      const [users, meta] = await repo.list();
      assert<Equals<typeof users, User[]>>();
      assert<Equals<typeof meta, { count: number }>>();
    });

    it('`repo.delete` should return void', () => {
      const repo = new UserRepository();
      type DeleteReturnType = Awaited<ReturnType<(typeof repo)['delete']>>;
      assert<Equals<DeleteReturnType, void>>();
    });

    it('`repo.delete` should accept correct argument', () => {
      const repo = new UserRepository();
      type ID = Parameters<(typeof repo)['delete']>[0];
      assert<Equals<ID, number | string>>();
    });
  });

  describe('Basic', () => {
    it('`repo.get`', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'get');

      const user = await repo.get(2);

      expect(user).toEqual({
        name: 'Anton',
        email: 'anton@anton.org',
        created_at: new Date('2023-02-11T14:52:14.565Z'),
      });

      expect(spy).toBeCalledWith(
        expect.objectContaining({ urlParams: { pk: 2 } })
      );
    });

    it('`repo.create`', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'create');
      const user = await repo.create({
        name: 'Anton',
        email: 'anton',
      });

      expect(user).toEqual({
        name: 'Anton',
        email: 'anton@anton.org',
        created_at: new Date('2023-02-11T14:52:14.565Z'),
      });

      expect(spy).toBeCalledWith(
        expect.objectContaining({ data: { name: 'Anton', email: 'anton' } })
      );
    });

    it('`repo.list`', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'get');
      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: { results: [USER], count: 1 } } as any;
      });

      const users = await repo.list(1);

      expect(users).toEqual([
        [
          {
            name: 'Anton',
            email: 'anton@anton.org',
            created_at: new Date('2023-02-11T14:52:14.565Z'),
          },
        ],
        { count: 1 },
      ]);

      expect(spy).toBeCalled();
    });

    it('`repo.update`', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'update');
      const user = await repo.update(1, {
        name: 'Fin',
      });

      expect(user).toEqual({
        name: 'Anton',
        email: 'anton@anton.org',
        created_at: new Date('2023-02-11T14:52:14.565Z'),
      });

      expect(spy).toBeCalledWith(
        expect.objectContaining({
          urlParams: { pk: 1 },
          data: { name: 'Fin' },
        })
      );
    });

    it('`repo.delete`', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'delete');
      expect(await repo.delete(1)).toBeUndefined();
      expect(spy).toBeCalledWith(
        expect.objectContaining({
          urlParams: { pk: 1 },
        })
      );
    });
  });

  describe('Request Config', () => {
    it('`repo.get` should support request configuration', async () => {
      const repo = new UserRepository();
      const config = { queryParams: { a: 420 } };
      const spy = jest.spyOn(repo.api, 'get');

      await repo.get(1, config);

      expect(spy).toBeCalledWith({
        urlParams: { pk: 1 },
        pagination: {},
        queryParams: { a: 420 },
        data: null,
      });
    });

    it('`repo.list` should support request configuration', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'list');
      const config = { queryParams: { a: 420 } };
      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: { results: [USER], count: 1 } } as any;
      });

      await repo.list(1, config);

      expect(spy).toBeCalledWith({
        urlParams: {},
        pagination: { page: 1 },
        queryParams: { a: 420, page: 1, page_size: 50 },
        data: null,
      });
    });

    it('`repo.list` should support pagination', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'list');
      const config = { queryParams: { a: 420, page_size: 20 } };
      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: { results: [USER], count: 1 } } as any;
      });

      await repo.list(5, config);

      expect(spy).toBeCalledWith({
        urlParams: {},
        pagination: { page: 5 },
        queryParams: { a: 420, page: 5, page_size: 20 },
        data: null,
      });
    });

    it('`repo.create` should support request configuration', async () => {
      const repo = new UserRepository();
      const config = { queryParams: { a: 420 } };
      const spy = jest.spyOn(repo.api, 'create');

      await repo.create(
        {
          name: 'Anton',
          email: 'anton',
        },
        config
      );

      expect(spy).toBeCalledWith({
        urlParams: {},
        pagination: {},
        queryParams: { a: 420 },
        data: {
          name: 'Anton',
          email: 'anton',
        },
      });
    });

    it('`repo.update` should support request configuration', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'update');
      const config = { queryParams: { a: 420 } };

      await repo.update(
        1,
        {
          name: 'Anton',
        },
        config
      );

      expect(spy).toBeCalledWith({
        urlParams: { pk: 1 },
        pagination: {},
        queryParams: { a: 420 },
        data: {
          name: 'Anton',
        },
      });
    });

    it('`repo.delete` should support request configuration', async () => {
      const repo = new UserRepository();
      const spy = jest.spyOn(repo.api, 'delete');
      const config = { queryParams: { a: 420 } };

      await repo.delete(1, config);

      expect(spy).toBeCalledWith({
        urlParams: { pk: 1 },
        pagination: {},
        queryParams: { a: 420 },
        data: null,
      });
    });
  });
});

describe('Repository Mixin Method Availability', () => {
  class UserSerializer extends serializers.ModelSerializer<UserDTO> {
    name = new serializers.StringField();
    email = new serializers.StringField();
    created_at = new serializers.DateField();
  }

  const api = new API<UserDTO>();
  const serializer = new UserSerializer();

  describe('RetrieveOnlyRepository', () => {
    class TestRepo extends repositories.RetrieveOnlyRepository {
      api = api;
      serializer = serializer;
    }

    it('should only have get method', () => {
      const repo = new TestRepo();

      expect(typeof repo.get).toBe('function');
      expect((repo as any).create).toBeUndefined();
      expect((repo as any).list).toBeUndefined();
      expect((repo as any).update).toBeUndefined();
      expect((repo as any).delete).toBeUndefined();
    });
  });

  describe('CreateOnlyRepository', () => {
    class TestRepo extends repositories.CreateOnlyRepository {
      api = api;
      serializer = serializer;
    }

    it('should only have create method', () => {
      const repo = new TestRepo();

      expect(typeof repo.create).toBe('function');
      expect((repo as any).get).toBeUndefined();
      expect((repo as any).list).toBeUndefined();
      expect((repo as any).update).toBeUndefined();
      expect((repo as any).delete).toBeUndefined();
    });
  });

  describe('ListOnlyRepository', () => {
    class TestRepo extends repositories.ListOnlyRepository {
      api = api;
      serializer = serializer;
    }

    it('should only have list method', () => {
      const repo = new TestRepo();

      expect(typeof repo.list).toBe('function');
      expect((repo as any).get).toBeUndefined();
      expect((repo as any).create).toBeUndefined();
      expect((repo as any).update).toBeUndefined();
      expect((repo as any).delete).toBeUndefined();
    });
  });

  describe('ReadOnlyRepository', () => {
    class TestRepo extends repositories.ReadOnlyRepository {
      api = api;
      serializer = serializer;
    }

    it('should have get and list methods only', () => {
      const repo = new TestRepo();

      expect(typeof repo.get).toBe('function');
      expect(typeof repo.list).toBe('function');
      expect((repo as any).create).toBeUndefined();
      expect((repo as any).update).toBeUndefined();
      expect((repo as any).delete).toBeUndefined();
    });
  });

  describe('ModelRepository', () => {
    class TestRepo extends repositories.ModelRepository {
      api = api;
      serializer = serializer;
    }

    it('should have all CRUD methods', () => {
      const repo = new TestRepo();

      expect(typeof repo.create).toBe('function');
      expect(typeof repo.get).toBe('function');
      expect(typeof repo.list).toBe('function');
      expect(typeof repo.update).toBe('function');
      expect(typeof repo.delete).toBe('function');
    });
  });

  describe('Custom Mixin Composition', () => {
    it('should support manual mixin composition', () => {
      class ListDeleteRepo extends repositories.mixins.DestroyMixin(
        repositories.mixins.ListMixin(repositories.BaseRepository)
      ) {
        api = api;
        serializer = serializer;
      }

      const repo = new ListDeleteRepo();

      expect(typeof repo.list).toBe('function');
      expect(typeof repo.delete).toBe('function');
      expect((repo as any).get).toBeUndefined();
      expect((repo as any).create).toBeUndefined();
      expect((repo as any).update).toBeUndefined();
    });

    it('should support triple mixin composition', () => {
      class WriteOnlyRepo extends repositories.mixins.DestroyMixin(
        repositories.mixins.UpdateMixin(
          repositories.mixins.CreateMixin(repositories.BaseRepository)
        )
      ) {
        api = api;
        serializer = serializer;
      }

      const repo = new WriteOnlyRepo();

      expect(typeof repo.create).toBe('function');
      expect(typeof repo.update).toBe('function');
      expect(typeof repo.delete).toBe('function');
      expect((repo as any).get).toBeUndefined();
      expect((repo as any).list).toBeUndefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('APIRepository should be alias for ModelRepository', () => {
      expect(repositories.APIRepository).toBe(repositories.ModelRepository);
    });

    it('APIRepository should have all CRUD methods', () => {
      class LegacyRepo extends repositories.APIRepository {
        api = api;
        serializer = serializer;
      }

      const repo = new LegacyRepo();

      expect(typeof repo.create).toBe('function');
      expect(typeof repo.get).toBe('function');
      expect(typeof repo.list).toBe('function');
      expect(typeof repo.update).toBe('function');
      expect(typeof repo.delete).toBe('function');
    });
  });
});
