import { BaseSerializer } from '../BaseSerializer';

export class EnumField<
  T,
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: any) => data as T;
  toDTO = (data: any) => data as T;
}
