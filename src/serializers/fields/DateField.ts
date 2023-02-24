import { BaseSerializer } from '../BaseSerializer';

export class DateField<
  R extends boolean = false,
  M extends boolean = false
> extends BaseSerializer<R, M> {
  fromDTO = (data: any) => new Date(data);
  toDTO = (data: any) => new Date(data).toISOString();
}
