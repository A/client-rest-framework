import { RequestContext } from '../lib/RequestContextBuilder';

export interface ISerializer {
  many: boolean;
  readonly: boolean;

  fromDTO: (arg: any) => any;
  toDTO: (arg: any) => any;
}

export type PK = number | string;

export interface IAPI {
  get(context: RequestContext): any;
  list(context: RequestContext): any;
  create(context: RequestContext): any;
  update(context: RequestContext): any;
  delete(context: RequestContext): any;
}

export interface WithPagination<T> {
  results: T[];
  count: number;
}

export type Constructor = new (...args: any[]) => {};
