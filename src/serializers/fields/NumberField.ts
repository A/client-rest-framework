import { BaseSerializer } from '../BaseSerializer';

export class NumberField<
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false,
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: any) => Number(data);
  toDTO = (data: any) => Number(data);
}
