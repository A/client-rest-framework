import merge from 'lodash.merge';

import { RequestContext } from '../types/RequestContext';

export * from './axiosClient';

interface HTTPClient {
  get: (...args: any) => any;
  post: (...args: any) => any;
  delete: (...args: any) => any;
  patch: (...args: any) => any;
}

// interface PaginationContext {
//   page: number;
// }

// export interface APIInterface<T extends any = any> {
//   get(r: RequestContext): Promise<T>;
//   create(r: RequestContext): Promise<T>;
//   list(r: RequestContext): Promise<T[]>;
//   update(r: RequestContext): Promise<T>;
//   delete(r: RequestContext): Promise<void>;
// }

export class BaseRESTAPI {
  client: HTTPClient;
  url = '/';

  public createRequestContext = (...contexts: Partial<RequestContext>[]) => {
    const defaultContext = {
      urlParams: {},
      queryParams: {},
      data: null,
    }

    return merge(defaultContext, ...contexts) as RequestContext;
  }

  protected buildListURL = (request: RequestContext) => {
    const q = new URLSearchParams(request.queryParams as any);
    return `${this.url}/?${q.toString()}`;
  };

  protected buildDetailURL = (context: RequestContext) => {
    if (!context.urlParams?.pk) {
      throw new Error("Datail URL can't be built without `pk`");
    }

    return `${this.url}/${context.urlParams.pk}`;
  };

  protected getHTTPClient = () => this.client;
}

export class RESTAPI<T> extends BaseRESTAPI {
  get = async (context: RequestContext): Promise<T> => {
    const url = this.buildDetailURL(context);
    const client = this.getHTTPClient();
    const response = await client.get(url);
    return response.data;
  };

  list = async (context: RequestContext): Promise<T[]> => {
    const url = this.buildListURL(context);
    const client = this.getHTTPClient();
    const response = await client.get(url);
    return response.data;
  };

  create = async (context: RequestContext): Promise<T> => {
    const url = this.buildListURL(context);
    const client = this.getHTTPClient();
    const response = await client.post(url, context.data);
    return response.data;
  };

  update = async (context: RequestContext): Promise<T> => {
    const url = this.buildDetailURL(context);
    const client = this.getHTTPClient();
    const response = await client.patch(url, context.data);
    return response.data;
  };

  delete = async (context: RequestContext): Promise<void> => {
    const url = this.buildDetailURL(context);
    const client = this.getHTTPClient();
    await client.delete(url);
  };
}
