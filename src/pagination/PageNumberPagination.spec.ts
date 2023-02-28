import { describe, expect, it, jest } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { RESTAPI } from '../api/RESTAPI';

import { PageNumberPagination } from './PageNumberPagination';


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface DTO {
  name: string;
}

const USER = { name: "anton" };

class HTTPClient {
  get = jest.fn(async () => {
    await sleep(20);
    return { data: { results: [USER], count: 1 } } as any
  })
}

describe('PageNumberPagination', () => {
  const client = new HTTPClient()

  it('should return proper paginated type', async () => {
    class API extends RESTAPI<DTO> {
      client = client as any
      pagination = new PageNumberPagination<DTO>()
      url = "/users"
    }

    const api = new API();
    const response = await api.list({})

    assert<Equals<typeof response, { count: number; items: { name: string }[] }>>();
  })

  it.each([
    {
      name: "default settings and empty context",
      options: {},
      context: {},
      expectedURL: "/users/?page=1&page_size=50"
    },
    {
      name: "specified pageSize constructor parameter",
      options: { pageSize: 20 },
      context: {},
      expectedURL: "/users/?page=1&page_size=20"
    },
    {
      name: "custom pageSizeQueryParam constructor parameter",
      options: { pageSize: 20, pageSizeQueryParam: "size" },
      context: {},
      expectedURL: "/users/?page=1&size=20"
    },
    {
      name: "custom pageQueryParam constructor parameter",
      options: { pageSize: 20, pageQueryParam: "p" },
      context: {},
      expectedURL: "/users/?p=1&page_size=20"
    },
    {
      name: "custom pageSize, pageSizeQueryParam, and pageQueryParam constructor parameters",
      options: { pageSize: 10, pageQueryParam: "p", pageSizeQueryParam: "s" },
      context: {},
      expectedURL: "/users/?p=1&s=10"
    },
    {
      name: "custom pageSize and page context parameters",
      options: {},
      context: { pagination: { page: 5, pageSize: 10} },
      expectedURL: "/users/?page=5&page_size=10"
    },
    {
      name: "mixed context and constructor parameters",
      options: { pageSize: 10, pageQueryParam: "p", pageSizeQueryParam: "s" },
      context: { pagination: { page: 8, pageSize: 20} },
      expectedURL: "/users/?p=8&s=20"
    },
  ])('$name', async ({ options, context, expectedURL}) => {
    class API extends RESTAPI<DTO> {
      client = client as any
      pagination = new PageNumberPagination<DTO>(options)
      url = "/users"
    }

    const api = new API();
    const response = await api.list(context as any);

    expect(response).toEqual({ count: 1, items: [{ name: "anton" }] });
    expect(client.get).toBeCalledWith(expectedURL)
  })
});
