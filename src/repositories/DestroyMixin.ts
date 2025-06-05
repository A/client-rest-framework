import {
  RequestContext,
  RequestContextBuilder,
} from '../lib/RequestContextBuilder';

import { Constructor, IAPI, ISerializer, PK } from './types';

export function DestroyMixin<TBase extends Constructor>(Base: TBase) {
  return class Destroy extends Base {
    api!: IAPI;
    serializer!: ISerializer;
    requestContextBuilder!: RequestContextBuilder;

    public async delete(
      pk: PK,
      config: Partial<RequestContext> = {}
    ): Promise<void> {
      const context = this.requestContextBuilder.create(
        { urlParams: { pk } },
        config
      );
      await this.api.delete(context);
    }
  };
}
