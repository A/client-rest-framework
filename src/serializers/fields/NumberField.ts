import { BaseSerializer } from '../BaseSerializer';

export class NumberField<
  R extends boolean = false,
  M extends boolean = false
> extends BaseSerializer<R, M> {
  fromDTO = (data: any) => Number(data);
  toDTO = (data: any) => Number(data);
}
