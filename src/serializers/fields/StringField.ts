import { BaseSerializer } from '../BaseSerializer';

export class StringField<
  R extends boolean = false,
  M extends boolean = false
> extends BaseSerializer<R, M> {
  fromDTO = (data: any) => String(data);
  toDTO = (data: any) => String(data);
}
