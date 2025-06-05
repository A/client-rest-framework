import {
  RequestContext,
  RequestContextBuilder,
} from '../lib/RequestContextBuilder';

import { Constructor, IAPI, ISerializer } from './types';

export function ListMixin<TBase extends Constructor>(Base: TBase) {
  return class List extends Base {
    api!: IAPI;
    serializer!: ISerializer;
    requestContextBuilder!: RequestContextBuilder;

    public async list(page = 1, config: Partial<RequestContext> = {}) {
      type SerializedItem = ReturnType<this['serializer']['fromDTO']>;
      const context = this.requestContextBuilder.create(
        { pagination: { page } },
        config
      );
      const { items, ...meta } = (await this.api.list(context)) as Awaited<
        ReturnType<this['api']['list']>
      >;
      const serializedItems = items.map(
        this.serializer.fromDTO
      ) as SerializedItem[];
      return [serializedItems, meta] as [SerializedItem[], typeof meta];
    }
  };
}
