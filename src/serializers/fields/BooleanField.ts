import { BaseSerializer } from '../BaseSerializer';

export class BooleanField<
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: any) => (data !== null ? Boolean(data) : null);
  toDTO = (data: any) => (data !== null ? Boolean(data) : null);
}
