import { BaseSerializer } from '../BaseSerializer';

export  class BooleanField<
  R extends boolean = false,
  M extends boolean = false
> extends BaseSerializer<R, M> {
  fromDTO = (data: any) => Boolean(data);
  toDTO = (data: any) => Boolean(data);
}

