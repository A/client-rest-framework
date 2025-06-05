import { RequestContext } from '../lib/RequestContextBuilder';
import { UrlBuilder } from '../lib/UrlBuilder';
import { QueryParams } from '../types/QueryParams';

interface IPagination {
  cast(data: any): any;
  buildContext?: (context: RequestContext) => RequestContext;
}

interface HTTPClient {
  get: (...args: any) => any;
  post: (...args: any) => any;
  delete: (...args: any) => any;
  patch: (...args: any) => any;
}

interface UrlBuilderConstrain {
  detail: (pk: number | string, data: { queryParams: QueryParams }) => string;
  list: (data: { queryParams: QueryParams }) => string;
}

interface Options {
  /** If true, adds slash into detail api url */
  appendSlash: boolean;
}

export class RESTAPI<DTO> {
  pagination: IPagination;
  client: HTTPClient;
  protected urls: UrlBuilderConstrain;
  url = '/';

  constructor(options: Partial<Options> = {}) {
    this.urls = new UrlBuilder({
      appendSlash: options.appendSlash,
      url: () => this.url,
    });
  }

  get = async (context: RequestContext) => {
    const pk = context?.urlParams?.pk;
    const queryParams = context.queryParams || {};

    if (!pk) {
      throw new Error('PK is missing');
    }

    const url = this.urls.detail(pk, { queryParams });
    const response = await this.client.get(url);
    return response.data as DTO;
  };

  list = async (context: RequestContext) => {
    type PaginatedAPIResponse = ReturnType<this['pagination']['cast']>;

    context = this.pagination.buildContext?.(context) || context;
    const queryParams = context.queryParams || {};

    const url = this.urls.list({ queryParams });
    const response = await this.client.get(url);
    return this.pagination.cast(response.data) as PaginatedAPIResponse;
  };

  create = async (context: RequestContext) => {
    const queryParams = context.queryParams || {};
    const url = this.urls.list({ queryParams });
    const response = await this.client.post(url, context.data);
    return response.data as DTO;
  };

  update = async (context: RequestContext) => {
    const pk = context?.urlParams?.pk;
    const queryParams = context.queryParams || {};

    if (!pk) {
      throw new Error('PK is missing');
    }

    const url = this.urls.detail(pk, {
      queryParams,
    });

    const response = await this.client.patch(url, context.data);
    return response.data as DTO;
  };

  delete = async (context: RequestContext) => {
    const pk = context?.urlParams?.pk;
    const queryParams = context.queryParams || {};

    if (!pk) {
      throw new Error('PK is missing');
    }

    const url = this.urls.detail(pk, {
      queryParams,
    });
    await this.client.delete(url);
  };
}
