import merge from 'lodash.merge';

import { RequestContext } from "../types/RequestContext";

interface PageNumberPaginationOptions {
  size?: number;
}

export interface WithPagination<T> {
  count: number;
  results: T;
}

export class PageNumberPagination<T extends Object = {}> {
  static DEFAULT_PAGE_SIZE = 50

  size: number;

  constructor(options: PageNumberPaginationOptions = {}) {
    this.size = options.size || PageNumberPagination.DEFAULT_PAGE_SIZE;
  }

  extendRequestContext(context: RequestContext) {
    const defaultPaginationContext = {
      page: 1,
      size: 50, // TODO: parametrize
    }

    return merge({ pagination: defaultPaginationContext }, context)
  }

  onRequest(context: RequestContext) {
    const { pagination } = context;
    const page = pagination.page ?? 1
    return merge(context, {
      queryParams: { page }
    })
  }

  onResponse(data: any): { count: number, results: T[] } {
    return data;
  }
}
