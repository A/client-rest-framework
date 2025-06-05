import {
  RequestContext,
  RequestContextBuilder,
} from '../lib/RequestContextBuilder';

import { Constructor, IAPI, ISerializer } from './types';

export function CreateMixin<TBase extends Constructor>(Base: TBase) {
  return class Create extends Base {
    api!: IAPI;
    serializer!: ISerializer;
    requestContextBuilder!: RequestContextBuilder;

    public async create(
      raw: Parameters<this['serializer']['toDTO']>[0],
      config: Partial<RequestContext> = {}
    ): Promise<ReturnType<this['serializer']['fromDTO']>> {
      const data = this.serializer.toDTO(raw);
      const context = this.requestContextBuilder.create(config, { data });
      const response = await this.api.create(context);
      return this.serializer.fromDTO(response);
    }
  };
}
