import { describe, expect, it } from '@jest/globals';
import { UrlBuilder } from './UrlBuilder';

describe('URLBuilder', () => {
  it.each([
    {
      method: "buildGetURL",
      options: { "url": "/users/", appendSlash: true },
      context: { urlParams: { pk: 1 } },
      expectedResult: "/users/1/"
    },
    {
      method: "buildGetURL",
      options: { "url": "/users/", appendSlash: true },
      context: { urlParams: { pk: 1 }, queryParams: { flash: true } },
      expectedResult: "/users/1/?flash=true"
    },
    {
      method: "buildCreateURL",
      options: { "url": "/users/", appendSlash: true },
      context: {},
      expectedResult: "/users/"
    },
    {
      method: "buildCreateURL",
      options: { "url": "/users/", appendSlash: false },
      context: {},
      expectedResult: "/users"
    },
    {
      method: "buildUpdateURL",
      options: { "url": "/users/1/profile" },
      context: { urlParams: { pk: 2 } },
      expectedResult: "/users/1/profile/2/"
    },
    {
      method: "buildListURL",
      options: { "url": "/products/", appendSlash: true },
      context: { urlParams: { pk: 1 }, queryParams: { status: "active" } },
      expectedResult: "/products/?status=active"
    },
    {
      method: "buildListURL",
      options: { "url": "/products/", appendSlash: true },
      context: { urlParams: { pk: 1 }, queryParams: { status: "active" } },
      expectedResult: "/products/?status=active"
    },
    {
      method: "buildDeleteURL",
      options: { "url": "/products/", appendSlash: true },
      context: { urlParams: { pk: 1 }, queryParams: { status: "active" } },
      expectedResult: "/products/1/?status=active"
    },
  ])(

    "should generate valid url ($method)",
    ({ method, options, context, expectedResult }) => {
      const builder = new UrlBuilder(options)

      // @ts-ignore
      const result = builder[method](context);
      expect(result).toEqual(expectedResult);
    }
  )
});
