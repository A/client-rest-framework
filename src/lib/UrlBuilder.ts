import { QueryParams } from '../types/QueryParams';

import { GetFun, result } from './utils';

interface UrlBuilderConstructorOptions {
  /** If true, adds slash into detail api url */
  appendSlash: boolean;
  url: GetFun<string>;
}

type PK = string | number;

export class UrlBuilder {
  options = {
    appendSlash: true,
  };

  url: GetFun<string> = '';

  constructor(options: Partial<UrlBuilderConstructorOptions> = {}) {
    if (!options.url) {
      throw new Error('`url` is required');
    }

    this.url = options.url;

    if (typeof options.appendSlash !== 'undefined') {
      this.options.appendSlash = options.appendSlash;
    }
  }

  private getUrl = () => result(this.url).replace(/\/$/, '');

  private createSearchParams = (queryParams?: QueryParams) => {
    if (!queryParams) {
      return '';
    }
    return new URLSearchParams(queryParams).toString();
  };

  /**
   * Get URL for list/collection operations (list, create)
   */
  list = ({ queryParams }: { queryParams: QueryParams }) => {
    const tailingSlash = this.options.appendSlash ? '/' : '';
    const baseUrl = this.getUrl();
    const qs = this.createSearchParams(queryParams);
    return qs.length > 0 ? `${baseUrl}/?${qs}` : `${baseUrl}${tailingSlash}`;
  };

  /**
   * Get URL for detail/item operations (get, update, delete)
   */
  detail = (pk: PK, { queryParams }: { queryParams: QueryParams }) => {
    const tailingSlash = this.options.appendSlash ? '/' : '';
    const baseUrl = this.getUrl();
    const qs = this.createSearchParams(queryParams);

    return qs.length > 0
      ? `${baseUrl}/${pk}/?${qs}`
      : `${baseUrl}/${pk}${tailingSlash}`;
  };
}
