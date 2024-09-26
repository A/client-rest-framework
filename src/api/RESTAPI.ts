import { RequestContext } from '../lib/RequestContextBuilder';
import { BaseAPI } from './BaseAPI';

interface IPagination {
  // @ts-ignore
  cast<T>(data: any): any
  buildContext?: (context: RequestContext) => RequestContext;
}

export class RESTAPI<DTO> extends BaseAPI {
  pagination: IPagination;

  get = async (context: RequestContext) => {
    const url = this.urlBuilder.buildGetURL(context);
    const response = await this.client.get(url);
    return response.data as DTO;
  };

  list = async (context: RequestContext) => {
    type PaginatedAPIResponse = ReturnType<this['pagination']['cast']>
    context = this.pagination.buildContext?.(context) || context;
    const url = this.urlBuilder.buildListURL(context);
    const response = await this.client.get(url);
    return this.pagination.cast<DTO>(response.data) as PaginatedAPIResponse;
  };

  create = async (context: RequestContext) => {
    const url = this.urlBuilder.buildCreateURL(context);
    const response = await this.client.post(url, context.data);
    return response.data as DTO;
  };

  update = async (context: RequestContext) => {
    const url = this.urlBuilder.buildUpdateURL(context);
    const response = await this.client.patch(url, context.data);
    return response.data as DTO;
  };

  delete = async (context: RequestContext) => {
    const url = this.urlBuilder.buildDeleteURL(context);
    await this.client.delete(url);
  };
}
