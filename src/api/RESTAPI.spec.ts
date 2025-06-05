import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { assert, Equals } from 'tsafe';

import { pagination } from '..';
import { RequestContext } from '../lib/RequestContextBuilder';

import { RESTAPI } from './RESTAPI';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface DTO {
  name: string;
}
const USER = { name: 'anton' };

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

describe('RESTAPI', () => {
  const client = new HTTPClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create RESTAPI with default options', () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      expect(api.url).toBe('/users');
      // @ts-ignore
      expect(api.urls).toBeDefined();
    });

    it('should create RESTAPI with appendSlash option', () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API({ appendSlash: false });
      // @ts-ignore
      expect(api.urls).toBeDefined();
    });

    it('should inherit from BaseAPI', () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      // Should have BaseAPI properties/methods
      expect(api).toBeInstanceOf(RESTAPI);
    });
  });

  describe('RESTAPI.get', () => {
    it('should call get with correct URL and return typed data', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      const user = await api.get({ urlParams: { pk: 1 } });

      assert<Equals<typeof user, DTO>>();
      expect(user).toEqual(USER);
      expect(client.get).toBeCalledWith('/users/1/');
    });

    it('should handle string primary keys', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.get({ urlParams: { pk: 'abc-123' } });

      expect(client.get).toBeCalledWith('/users/abc-123/');
    });

    it('should handle query parameters', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.get({
        urlParams: { pk: 1 },
        queryParams: { include: 'profile' },
      });

      expect(client.get).toBeCalledWith('/users/1/?include=profile');
    });

    it('should work with appendSlash: false', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API({ appendSlash: false });
      await api.get({ urlParams: { pk: 1 } });

      expect(client.get).toBeCalledWith('/users/1');
    });
  });

  describe('RESTAPI.list', () => {
    it('should call list with NoPagination', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination<DTO>();
        url = '/users';
      }

      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: [USER] } as any;
      });

      const api = new API();
      const response = await api.list({});

      assert<
        Equals<
          typeof response,
          {
            items: { name: string }[];
          }
        >
      >();

      expect(response).toEqual({
        items: [{ name: 'anton' }],
      });
      expect(client.get).toBeCalledWith('/users/');
    });

    it('should call list with PageNumberPagination', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.PageNumberPagination<DTO>({
          pageSize: 20,
          pageSizeQueryParam: 'size',
          pageQueryParam: 'page',
        });
        url = '/users';
      }

      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: { results: [USER], count: 1 } } as any;
      });

      const api = new API();
      const response = await api.list({});

      assert<
        Equals<
          typeof response,
          {
            count: number;
            items: { name: string }[];
          }
        >
      >();

      expect(response).toEqual({
        count: 1,
        items: [{ name: 'anton' }],
      });
      expect(client.get).toBeCalledWith('/users/?page=1&size=20');
    });

    it('should handle query parameters in list', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination<DTO>();
        url = '/users';
      }

      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: [USER] } as any;
      });

      const api = new API();
      await api.list({ queryParams: { status: 'active', page: 1 } });

      expect(client.get).toBeCalledWith('/users/?status=active&page=1');
    });

    it('should call pagination.buildContext if available', async () => {
      const mockPagination = {
        cast: jest.fn((data) => ({ items: data })),
        buildContext: jest.fn((context: any) => ({
          ...context,
          queryParams: { ...context.queryParams, page_size: 20 },
        })),
      };

      class API extends RESTAPI<DTO> {
        client = client;
        pagination = mockPagination;
        url = '/users';
      }

      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: [USER] } as any;
      });

      const api = new API();
      const context: RequestContext = { queryParams: { search: 'test' } };
      await api.list(context);

      expect(mockPagination.buildContext).toBeCalledWith(context);
      expect(client.get).toBeCalledWith('/users/?search=test&page_size=20');
    });

    it('should work without pagination.buildContext', async () => {
      const mockPagination = {
        cast: jest.fn((data) => ({ items: data })),
        // no buildContext method
      };

      class API extends RESTAPI<DTO> {
        client = client;
        pagination = mockPagination;
        url = '/users';
      }

      client.get.mockImplementationOnce(async () => {
        await sleep(20);
        return { data: [USER] } as any;
      });

      const api = new API();
      await api.list({ queryParams: { search: 'test' } });

      expect(client.get).toBeCalledWith('/users/?search=test');
    });
  });

  describe('RESTAPI.create', () => {
    it('should call create with correct URL and data', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      const user = await api.create({ data: { name: 'anton' } });

      assert<Equals<typeof user, DTO>>();
      expect(user).toEqual(USER);
      expect(client.post).toBeCalledWith('/users/', { name: 'anton' });
    });

    it('should handle query parameters in create', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.create({
        data: { name: 'anton' },
        queryParams: { format: 'json' },
      });

      expect(client.post).toBeCalledWith('/users/?format=json', {
        name: 'anton',
      });
    });

    it('should work with appendSlash: false', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API({ appendSlash: false });
      await api.create({ data: { name: 'anton' } });

      expect(client.post).toBeCalledWith('/users', { name: 'anton' });
    });
  });

  describe('RESTAPI.update', () => {
    it('should call update with correct URL and data', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      const user = await api.update({
        urlParams: { pk: 1 },
        data: { name: 'anton' },
      });

      assert<Equals<typeof user, DTO>>();
      expect(user).toEqual(USER);
      expect(client.patch).toBeCalledWith('/users/1/', { name: 'anton' });
    });

    it('should throw error when pk is missing', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();

      await expect(api.update({ data: { name: 'anton' } })).rejects.toThrow(
        'PK is missing'
      );
    });

    it('should throw error when pk is undefined', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();

      await expect(
        api.update({
          urlParams: { pk: undefined as any },
          data: { name: 'anton' },
        })
      ).rejects.toThrow('PK is missing');
    });

    it('should handle query parameters in update', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.update({
        urlParams: { pk: 1 },
        data: { name: 'anton' },
        queryParams: { force: true },
      });

      expect(client.patch).toBeCalledWith('/users/1/?force=true', {
        name: 'anton',
      });
    });

    it('should handle string primary keys', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.update({
        urlParams: { pk: 'user-123' },
        data: { name: 'anton' },
      });

      expect(client.patch).toBeCalledWith('/users/user-123/', {
        name: 'anton',
      });
    });
  });

  describe('RESTAPI.delete', () => {
    it('should call delete with correct URL', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      const response = await api.delete({ urlParams: { pk: 1 } });

      assert<Equals<typeof response, void>>();
      expect(response).toEqual(undefined);
      expect(client.delete).toBeCalledWith('/users/1/');
    });

    it('should throw error when pk is missing', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();

      await expect(api.delete({})).rejects.toThrow('PK is missing');
    });

    it('should throw error when pk is undefined', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();

      await expect(
        api.delete({ urlParams: { pk: undefined as any } })
      ).rejects.toThrow('PK is missing');
    });

    it('should handle query parameters in delete', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.delete({
        urlParams: { pk: 1 },
        queryParams: { force: true },
      });

      expect(client.delete).toBeCalledWith('/users/1/?force=true');
    });

    it('should handle string primary keys', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      await api.delete({ urlParams: { pk: 'user-123' } });

      expect(client.delete).toBeCalledWith('/users/user-123/');
    });
  });

  describe('URL Generation', () => {
    it('should respect appendSlash option across all methods', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/api/v1/users';
      }

      // Test with appendSlash: false
      const apiNoSlash = new API({ appendSlash: false });

      await apiNoSlash.get({ urlParams: { pk: 1 } });
      expect(client.get).toBeCalledWith('/api/v1/users/1');

      await apiNoSlash.create({ data: { name: 'test' } });
      expect(client.post).toBeCalledWith('/api/v1/users', { name: 'test' });

      await apiNoSlash.update({ urlParams: { pk: 1 }, data: { name: 'test' } });
      expect(client.patch).toBeCalledWith('/api/v1/users/1', { name: 'test' });

      await apiNoSlash.delete({ urlParams: { pk: 1 } });
      expect(client.delete).toBeCalledWith('/api/v1/users/1');
    });

    it('should handle complex URLs', async () => {
      class API extends RESTAPI<DTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/api/v1/organizations/123/users';
      }

      const api = new API();

      await api.get({ urlParams: { pk: 456 } });
      expect(client.get).toBeCalledWith('/api/v1/organizations/123/users/456/');
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP client errors', async () => {
      const errorClient = {
        // @ts-ignore
        get: jest.fn().mockRejectedValue(new Error('Network error')),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      class API extends RESTAPI<DTO> {
        client = errorClient;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();

      await expect(api.get({ urlParams: { pk: 1 } })).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for DTO', async () => {
      interface CustomDTO {
        id: number;
        username: string;
        active: boolean;
      }

      class API extends RESTAPI<CustomDTO> {
        client = client;
        pagination = new pagination.NoPagination();
        url = '/users';
      }

      const api = new API();
      const user = await api.get({ urlParams: { pk: 1 } });

      // TypeScript should infer the correct type
      assert<Equals<typeof user, CustomDTO>>();
    });
  });
});
