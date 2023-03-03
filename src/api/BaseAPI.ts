import merge from 'lodash.merge';

import { RequestContext } from '../types/RequestContext';


interface HTTPClient {
  get: (...args: any) => any;
  post: (...args: any) => any;
  delete: (...args: any) => any;
  patch: (...args: any) => any;
}


interface BaseRESTAPIOptions {
  /** If true, adds slash into detail api url */
  appendSlash: boolean
}


export class BaseAPI {
  options: BaseRESTAPIOptions = {
    appendSlash: true,
  }

  client: HTTPClient;
  url = '/';

  constructor(options: Partial<BaseRESTAPIOptions> = {}) {
    Object.assign(this.options, options);
  }

  public createRequestContext = (...contexts: Partial<RequestContext>[]) => {
    const defaultContext = {
      urlParams: {},
      queryParams: {},
      pagination: {},
      data: null,
    }

    return merge(defaultContext, ...contexts) as RequestContext;
  }

  protected buildListURL = (request: RequestContext) => {
    const tailingSlash = this.options.appendSlash ? "/" : ""

    const q = new URLSearchParams(request.queryParams as any);
    const qs = q.toString()
    return qs.length > 0
      ? `${this.url}/?${q.toString()}`
      : `${this.url}${tailingSlash}`
  };

  protected buildDetailURL = (context: RequestContext) => {
    const tailingSlash = this.options.appendSlash ? "/" : ""

    if (!context.urlParams?.pk) {
      throw new Error("Datail URL can't be built without `pk`");
    }

    return `${this.url}/${context.urlParams.pk}${tailingSlash}`;
  };
}
