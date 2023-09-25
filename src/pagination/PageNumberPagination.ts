import { RequestContext } from "../types/RequestContext";

interface PageNumberPaginationOptions {
  pageSize: number
  pageSizeQueryParam: string
  pageQueryParam: string
}

export class PageNumberPagination<DTO> {
  options: PageNumberPaginationOptions = {
    pageSize: 50,
    pageSizeQueryParam: 'page_size',
    pageQueryParam: 'page',
  }

  constructor(options: Partial<PageNumberPaginationOptions> = {}) {
    Object.assign(this.options, options);
  }

  buildContext(context: RequestContext) {
    const pagination = {
      page: 1,
      pageSize: this.options.pageSize
    }

    Object.assign(pagination, context.pagination);
    context.queryParams = context.queryParams || {}

    if (Boolean(context.queryParams[this.options.pageSizeQueryParam])) {
      pagination.pageSize = context.queryParams[this.options.pageSizeQueryParam] as number
    }

    context.queryParams[this.options.pageQueryParam] = pagination.page
    context.queryParams[this.options.pageSizeQueryParam] = pagination.pageSize
    return context
  }

  cast(data: any) {
    return {
      count: data.count,
      items: data.results,
    } as { items: DTO[], count: number };
  }
}
