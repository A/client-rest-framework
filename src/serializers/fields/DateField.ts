import { BaseSerializer } from '../BaseSerializer';

export class DateField<
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false,
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: string) => new Date(data);
  toDTO = (data: Date) => new Date(data).toISOString();
}
