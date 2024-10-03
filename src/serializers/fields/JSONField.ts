import { BaseSerializer } from '../BaseSerializer';

export class JSONField<
  T extends any,
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false,
> extends BaseSerializer<R, M, O> {
  fromDTO = (data: any): T => data
  toDTO = (data: T): T => data
}
