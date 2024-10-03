import { BaseSerializer } from '../BaseSerializer';

export class BooleanField<
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false,
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: any) => Boolean(data);
  toDTO = (data: any) => Boolean(data);
}

