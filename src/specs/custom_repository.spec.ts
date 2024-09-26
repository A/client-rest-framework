/* eslint-disable max-classes-per-file */
import { describe, expect, it, jest } from '@jest/globals';
import { pagination, repositories, serializers, RequestContext } from '..'
import { assert, Equals } from 'tsafe';
import { RESTAPI } from '../api';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Full Case", () => {
  interface UserDTO {
    id: number;
    phone: string | null;
    username: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  }

  interface User {
    id: number;
    phone: string | null;
    username: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  }

  const USER: UserDTO = {
    id: 42,
    phone: "+840901234567",
    username: "anton",
    first_name: "Anton",
    last_name: "Shuvalov",
    email: "anton@example.com",
  }

  class HTTPClient {
    get = jest.fn(async () => {
      await sleep(20);
      return { data: USER };
    })
    post = jest.fn(async () => {
      await sleep(20);
      return { data: USER };
    })
    patch = jest.fn(async () => {
      await sleep(20);
      return { data: USER };
    })
    delete = jest.fn(async () => {
      await sleep(20);
      return;
    })
  }

  const client = new HTTPClient()

  class UserApi extends RESTAPI<UserDTO> {
    client = client
    pagination = new pagination.NoPagination() as any
    url = '/api/users/me'

    get = async (context: RequestContext) => {
      const url = this.urlBuilder.buildListURL(context)
      // @ts-ignore
      const response = await this.client.get(url);
      return response.data as UserDTO;
    };

    update = async (context: RequestContext) => {
      const url = this.urlBuilder.buildListURL(context)
      // @ts-ignore
      const response = await this.client.patch(url, context.data);
      return response.data as UserDTO;
    };
  }

  class UserSerializer<
    R extends boolean = true,
    M extends boolean = false,
  > extends serializers.ModelSerializer<UserDTO, R, M> {
    id = new serializers.NumberField({ readonly: true })
    username = new serializers.StringField({ readonly: true })
    email = new serializers.StringField({ readonly: true })

    phone = new serializers.EnumField<string | null>()
    first_name = new serializers.EnumField<string | null>()
    last_name = new serializers.EnumField<string | null>()
  }

  class UserRepository extends repositories.APIRepository {
    api = new UserApi()
    serializer = new UserSerializer()

    // @ts-ignore
    public async get(
      config: Partial<RequestContext> = {}
    ) {
      const context = this.requestContextBuilder.create(config);
      const response = await this.api.get(context);
      return this.serializer.fromDTO(response);
    }

    // @ts-ignore
    public async update(
      diff: Parameters<this['serializer']['toDTO']>[0],
      config: Partial<RequestContext> = {}
    ) {
      const data = this.serializer.toDTO(diff);
      const context = this.requestContextBuilder.create({ data }, config)
      const response = await this.api.update(context);
      return this.serializer.fromDTO(response);
    }
  }

  it('Custom Repository should call get properly', async () => {
    const repo = new UserRepository()
    const spy = jest.spyOn(client, 'get');
    const user = await repo.get()

    expect(user).toEqual(USER)

    type GetReturnType = Awaited<ReturnType<(typeof repo)['get']>>;
    assert<Equals<GetReturnType, User>>();

    expect(spy).toBeCalledWith("/api/users/me/");
  })

  it('Custom Repository should call update properly', async () => {
    const repo = new UserRepository()
    const spyClient = jest.spyOn(client, 'patch');
    await repo.update(USER)

    type GetReturnType = Awaited<ReturnType<(typeof repo)['update']>>;
    assert<Equals<GetReturnType, User>>();
    expect(spyClient).toBeCalledWith(
      "/api/users/me/",
      { "first_name": "Anton", "last_name": "Shuvalov", "phone": "+840901234567" },
    );
  })
})
