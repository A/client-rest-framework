import { WithPagination } from '../repositories';

export * from './axiosClient';

interface HTTPClient {
  get: (...args: any) => any;
  post: (...args: any) => any;
  delete: (...args: any) => any;
  patch: (...args: any) => any;
}

export interface APIRequest<T extends any> {
  urlParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean>;
  data?: T;
  pagination?: PaginationContext;
}

interface PaginationContext {
  page: number;
}

export interface APIInterface<T extends any = any> {
  get(r: APIRequest<T>): Promise<T>;
  create(r: APIRequest<T>): Promise<T>;
  list(r: APIRequest<T>): Promise<WithPagination<T>>;
  update(r: APIRequest<T>): Promise<T>;
  delete(r: APIRequest<T>): Promise<void>;
}

export class BaseRESTAPI {
  client: HTTPClient;
  url = '/';

  protected buildListURL = (request: APIRequest<any>) => {
    // TODO: convert query params

    const q = new URLSearchParams(request.queryParams as any);
    const { pagination } = request;

    if (pagination) {
      q.set('page', String(pagination.page));
    }

    return `${this.url}/?${q.toString()}`;
  };

  protected buildDetailURL = (request: APIRequest<any>) => {
    if (!request.urlParams?.pk) {
      throw new Error("Datail URL can't be built without `pk`");
    }

    return `${this.url}/${request.urlParams.pk}`;
  };

  protected getHTTPClient = () => this.client;
}

export class RESTAPI<T> extends BaseRESTAPI {
  get = async (request: APIRequest<T>): Promise<T> => {
    const url = this.buildDetailURL(request);
    const client = this.getHTTPClient();
    const response = await client.get(url);
    return response.data;
  };

  list = async (request: APIRequest<T>): Promise<WithPagination<T>> => {
    const url = this.buildListURL(request);
    const client = this.getHTTPClient();
    const response = await client.get(url);
    return response.data;
  };

  create = async (request: APIRequest<T>): Promise<T> => {
    const url = this.buildListURL(request);
    const client = this.getHTTPClient();
    const response = await client.post(url, request.data);
    return response.data;
  };

  update = async (request: APIRequest<T>): Promise<T> => {
    const url = this.buildDetailURL(request);
    const client = this.getHTTPClient();
    const response = await client.patch(url, request.data);
    return response.data;
  };

  delete = async (request: APIRequest<T>): Promise<void> => {
    const url = this.buildDetailURL(request);
    const client = this.getHTTPClient();
    await client.delete(url);
  };
}
