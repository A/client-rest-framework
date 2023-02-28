import { RequestContext } from '../types/RequestContext';

import { BaseAPI } from './BaseAPI';

interface IPagination {
    // @ts-ignore
    cast<T>(data: any): any
    buildContext?: (context: RequestContext) => RequestContext;
}

export class RESTAPI<DTO> extends BaseAPI {
  pagination: IPagination;

  get = async (context: RequestContext) => {
    const url = this.buildDetailURL(context);
    const response = await this.client.get(url);
    return response.data as DTO;
  };

  list = async (context: RequestContext) => {
    type PaginatedAPIResponse = ReturnType<this['pagination']['cast']>
    context = this.pagination.buildContext?.(context) || context;
    const url = this.buildListURL(context);
    const response = await this.client.get(url);
    return this.pagination.cast<DTO>(response.data) as PaginatedAPIResponse;
  };

  create = async (context: RequestContext) => {
    const url = this.buildListURL(context);
    const response = await this.client.post(url, context.data);
    return response.data as DTO;
  };

  update = async (context: RequestContext) => {
    const url = this.buildDetailURL(context);
    const response = await this.client.patch(url, context.data);
    return response.data as DTO;
  };

  delete = async (context: RequestContext) => {
    const url = this.buildDetailURL(context);
    await this.client.delete(url);
  };
}
