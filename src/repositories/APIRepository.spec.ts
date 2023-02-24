import { describe, expect, it, jest } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { repositories, serializers } from '..';

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

const createApi = () => ({
  get: jest.fn(async () => {
    await sleep(20);
    return USER;
  }),
  create: jest.fn(async () => {
    await sleep(20);
    return USER;
  }),
  update: jest.fn(async () => {
    await sleep(20);
    return USER;
  }),
  list: jest.fn(async () => {
    await sleep(20);
    return { count: 1, results: [USER] };
  }),
  delete: jest.fn(async () => {
    await sleep(20);
  }),
});

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

  const api = createApi();

  class UserRepository extends repositories.APIRepository<UserDTO> {
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
      assert<Equals<ID, number>>();
      assert<Equals<UpdateArgument, Partial<UserToDTO>>>();
    });

    it('`repo.list` should return paginated parsed model', () => {
      const repo = new UserRepository();
      type ListReturnType = Awaited<ReturnType<(typeof repo)['list']>>;
      assert<Equals<ListReturnType, repositories.WithPagination<User>>>();
    });

    it('`repo.delete` should return void', () => {
      const repo = new UserRepository();
      type DeleteReturnType = Awaited<ReturnType<(typeof repo)['delete']>>;
      assert<Equals<DeleteReturnType, void>>();
    });

    it('`repo.delete` should accept correct argument', () => {
      const repo = new UserRepository();
      type ID = Parameters<(typeof repo)['delete']>[0];
      assert<Equals<ID, number>>();
    });
  });

  it('get()', async () => {
    const repo = new UserRepository();
    const user = await repo.get(1);

    expect(user).toEqual({
      name: 'Anton',
      email: 'anton@anton.org',
      created_at: new Date('2023-02-11T14:52:14.565Z'),
    });

    expect(api.get).toBeCalledWith({ urlParams: { pk: 1 } });
  });

  it('create()', async () => {
    const repo = new UserRepository();
    const user = await repo.create({
      name: 'Anton',
      email: 'anton',
    });

    expect(user).toEqual({
      name: 'Anton',
      email: 'anton@anton.org',
      created_at: new Date('2023-02-11T14:52:14.565Z'),
    });

    expect(api.get).toBeCalledWith({ urlParams: { pk: 1 } });
  });

  it('list()', async () => {
    const repo = new UserRepository();
    const users = await repo.list();

    expect(users).toEqual({
      count: 1,
      results: [
        {
          name: 'Anton',
          email: 'anton@anton.org',
          created_at: new Date('2023-02-11T14:52:14.565Z'),
        },
      ],
    });

    expect(api.list).toBeCalled();
  });

  it('update()', async () => {
    const repo = new UserRepository();
    const user = await repo.update(1, {
      name: 'Fin',
    });

    expect(user).toEqual({
      name: 'Anton',
      email: 'anton@anton.org',
      created_at: new Date('2023-02-11T14:52:14.565Z'),
    });

    expect(api.update).toBeCalledWith({
      urlParams: { pk: 1 },
      data: { name: 'Fin' },
    });
  });

  it('delete()', async () => {
    const repo = new UserRepository();
    expect(await repo.delete(1)).toBeUndefined();
    expect(api.delete).toBeCalledWith({
      urlParams: { pk: 1 },
    });
  });
  //
  // describe("pendingRequests", () => {
  //   class UserRepository extends repositories.APIRepository<UserDTO> {
  //     api = createApi()
  //     serializer = new UserSerializer();
  //   }
  //
  //   it.each([
  //     { method: "get" },
  //     { method: "list" },
  //     { method: "create" },
  //     { method: "update" },
  //     { method: "delete" },
  //   ])("Pending $method request should be tracked", async ({ method }) => {
  //     const repo = new UserRepository();
  //
  //     // @ts-ignore
  //     const p = repo[method]({});
  //
  //     expect(repo.hasPendingRequests()).toBeTruthy();
  //     expect(repo.hasPendingRequests([method as any])).toBeTruthy();
  //
  //     await sleep(10)
  //
  //     // @ts-ignore
  //     const p2 = repo[method]({});
  //
  //     await p
  //
  //     expect(repo.hasPendingRequests()).toBeTruthy();
  //     expect(repo.hasPendingRequests([method as any])).toBeTruthy();
  //
  //     await p2
  //
  //     expect(repo.hasPendingRequests()).toBeFalsy();
  //     expect(repo.hasPendingRequests([method as any])).toBeFalsy();
  //   })
  //
  // })
});
