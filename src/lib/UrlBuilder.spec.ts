import { describe, expect, it } from '@jest/globals';

import { UrlBuilder } from './UrlBuilder';

describe('URLBuilder', () => {
  it.each([
    // detail() method tests (formerly buildGetURL, buildUpdateURL, buildDeleteURL)
    {
      method: 'detail',
      options: { url: () => '/users/', appendSlash: true },
      pk: 1,
      queryParams: {},
      expectedResult: '/users/1/',
    },
    {
      method: 'detail',
      options: { url: () => '/users/', appendSlash: true },
      pk: 1,
      queryParams: { flash: true },
      expectedResult: '/users/1/?flash=true',
    },
    {
      method: 'detail',
      options: { url: () => '/users/1/profile' },
      pk: 2,
      queryParams: {},
      expectedResult: '/users/1/profile/2/',
    },
    {
      method: 'detail',
      options: { url: () => '/products/', appendSlash: true },
      pk: 1,
      queryParams: { status: 'active' },
      expectedResult: '/products/1/?status=active',
    },

    // list() method tests (formerly buildCreateURL, buildListURL)
    {
      method: 'list',
      options: { url: () => '/users/', appendSlash: true },
      pk: null, // not used for list
      queryParams: {},
      expectedResult: '/users/',
    },
    {
      method: 'list',
      options: { url: () => '/users/', appendSlash: false },
      pk: null, // not used for list
      queryParams: {},
      expectedResult: '/users',
    },
    {
      method: 'list',
      options: { url: () => '/products/', appendSlash: true },
      pk: null, // not used for list
      queryParams: { status: 'active' },
      expectedResult: '/products/?status=active',
    },
  ])(
    'should generate valid url ($method)',
    ({ method, options, pk, queryParams, expectedResult }) => {
      const builder = new UrlBuilder(options);

      let result: string;
      if (method === 'detail') {
        result = builder.detail(pk!, { queryParams });
      } else {
        result = builder.list({ queryParams });
      }

      expect(result).toEqual(expectedResult);
    }
  );

  // Additional edge case tests
  it.each([
    {
      description: 'should handle appendSlash false for detail URLs',
      method: 'detail',
      options: { url: () => '/users', appendSlash: false },
      pk: 123,
      queryParams: {},
      expectedResult: '/users/123',
    },
    {
      description: 'should handle multiple query params',
      method: 'list',
      options: { url: () => '/api/items', appendSlash: true },
      pk: null,
      queryParams: { page: 2, limit: 50, active: true },
      expectedResult: '/api/items/?page=2&limit=50&active=true',
    },
    {
      description: 'should handle string primary keys',
      method: 'detail',
      options: { url: () => '/users', appendSlash: true },
      pk: 'abc-123',
      queryParams: { expand: 'profile' },
      expectedResult: '/users/abc-123/?expand=profile',
    },
  ])('$description', ({ method, options, pk, queryParams, expectedResult }) => {
    const builder = new UrlBuilder(options);

    let result: string;
    if (method === 'detail') {
      result = builder.detail(pk!, { queryParams });
    } else {
      result = builder.list({ queryParams });
    }

    expect(result).toEqual(expectedResult);
  });
});
