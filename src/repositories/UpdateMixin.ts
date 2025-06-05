import {
  RequestContext,
  RequestContextBuilder,
} from '../lib/RequestContextBuilder';

import { Constructor, IAPI, ISerializer, PK } from './types';

export function UpdateMixin<TBase extends Constructor>(Base: TBase) {
  return class Update extends Base {
    api!: IAPI;
    serializer!: ISerializer;
    requestContextBuilder!: RequestContextBuilder;

    public async update(
      pk: PK,
      diff: Partial<Parameters<this['serializer']['toDTO']>[0]>,
      config: Partial<RequestContext> = {}
    ): Promise<ReturnType<this['serializer']['fromDTO']>> {
      const data = this.serializer.toDTO(diff);
      const context = this.requestContextBuilder.create(
        { urlParams: { pk }, data },
        config
      );
      const response = await this.api.update(context);
      return this.serializer.fromDTO(response);
    }
  };
}
