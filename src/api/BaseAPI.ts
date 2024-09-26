import { UrlBuilder } from '../lib/UrlBuilder';

interface HTTPClient {
  get: (...args: any) => any;
  post: (...args: any) => any;
  delete: (...args: any) => any;
  patch: (...args: any) => any;
}

interface BaseAPIOptions {
  /** If true, adds slash into detail api url */
  appendSlash: boolean
}


export class BaseAPI {
  client: HTTPClient;
  urlBuilder: UrlBuilder;
  url = '/';

  constructor(options: Partial<BaseAPIOptions> = {}) {
    this.urlBuilder = new UrlBuilder({
      appendSlash: options.appendSlash,
      url: () => this.url,
    })
  }
}
