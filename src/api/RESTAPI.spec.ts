import { describe, expect, it, jest } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { pagination } from '..';

import { RESTAPI } from './RESTAPI';


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface DTO {
  name: string;
}
const USER = { name: "anton" };

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

describe('RESTAPI', () => {
  const client = new HTTPClient()

  it('`RESTAPI.get`', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.NoPagination()
      url = "/users"
    }

    const api = new API();
    const user = await api.get({ urlParams: { pk: 1 } })

    assert<Equals<typeof user, DTO>>();
    expect(user).toEqual(USER);
    expect(client.get).toBeCalledWith("/users/1/")
  })

  it('`RESTAPI.list` with NoPagination', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.NoPagination<DTO>()
      url = "/users"
    }

    client.get.mockImplementationOnce(async () => {
      await sleep(20);
      return { data: [USER] } as any
    })

    const api = new API();
    const response = await api.list({})

    assert<Equals<typeof response, {
      items: { name: string }[]
    }>>();

    expect(response).toEqual({
      items: [{ name: "anton" }]
    });
    expect(client.get).toBeCalledWith("/users/")
  })

  it('`RESTAPI.list` with PageNumberPagination', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.PageNumberPagination<DTO>()
      url = "/users"
    }

    client.get.mockImplementationOnce(async () => {
      await sleep(20);
      return { data: { results: [USER], count: 1 } } as any
    })

    const api = new API();
    const response = await api.list({})

    assert<Equals<typeof response, {
      count: number
      items: { name: string }[]
    }>>();

    expect(response).toEqual({
      count: 1,
      items: [{ name: "anton" }]
    });
    expect(client.get).toBeCalledWith("/users/")
  })

  it('`RESTAPI.create`', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.NoPagination()
      url = "/users"
    }

    const api = new API();
    const user = await api.create({ data: { name: "anton" } })

    assert<Equals<typeof user, DTO>>();
    expect(user).toEqual(USER);
    expect(client.post).toBeCalledWith("/users/", { name: "anton" })
  })

  it('`RESTAPI.update`', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.NoPagination()
      url = "/users"
    }

    const api = new API();
    const user = await api.update({ urlParams: { pk: 1 }, data: { name: "anton" } })

    assert<Equals<typeof user, DTO>>();
    expect(user).toEqual(USER);
    expect(client.patch).toBeCalledWith("/users/1/", { name: "anton" })
  })

  it('`RESTAPI.delete`', async () => {
    class API extends RESTAPI<DTO> {
      client = client
      pagination = new pagination.NoPagination()
      url = "/users"
    }

    const api = new API();
    const response = await api.delete({ urlParams: { pk: 1 } })

    assert<Equals<typeof response, void>>();
    expect(response).toEqual(undefined);
    expect(client.delete).toBeCalledWith("/users/1/")
  })

});
