import { describe, expect, it } from '@jest/globals';

import { BaseAPI } from './BaseAPI';

describe('BaseAPI', () => {
  it('should build correct list url', () => {
    class API extends BaseAPI {
      url = "/users"
    }

    // @ts-ignore
    expect(new API().buildListURL({})).toEqual("/users")
  })

  it('should build correct detail url', () => {
    class API extends BaseAPI {
      url = "/users"
    }

    // @ts-ignore
    expect(new API().buildDetailURL({ urlParams: { pk: 1 }})).toEqual("/users/1/")
  })

  it('shouldn\'t add tailing slash to detail URL when `appendSlash` is disabled', () => {
    class API extends BaseAPI {
      url = "/users"
    }

    // @ts-ignore
    expect(new API({ appendSlash: false }).buildDetailURL({ urlParams: { pk: 1 }}))
      .toEqual("/users/1")
  })
});
