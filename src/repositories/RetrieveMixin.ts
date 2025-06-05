import {
  RequestContext,
  RequestContextBuilder,
} from '../lib/RequestContextBuilder';

import { Constructor, IAPI, ISerializer, PK } from './types';

export function RetrieveMixin<TBase extends Constructor>(Base: TBase) {
  return class Retrieve extends Base {
    api!: IAPI;
    serializer!: ISerializer;
    requestContextBuilder!: RequestContextBuilder;

    public async get(
      pk: PK,
      config: Partial<RequestContext> = {}
    ): Promise<ReturnType<this['serializer']['fromDTO']>> {
      const context = this.requestContextBuilder.create(
        { urlParams: { pk } },
        config
      );
      const response = await this.api.get(context);
      return this.serializer.fromDTO(response);
    }
  };
}
