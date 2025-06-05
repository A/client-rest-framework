import { RequestContextBuilder, RequestContext } from '../lib/RequestContextBuilder';

export interface WithPagination<T> {
  results: T[];
  count: number;
}

interface IAPI {
  get(context: RequestContext): any
  list(context: RequestContext): any
  create(context: RequestContext): any
  update(context: RequestContext): any
  delete(context: RequestContext): any
}

interface ISerializer {
  many: boolean;
  readonly: boolean;

  fromDTO: (arg: any) => any;
  toDTO: (arg: any) => any;
}

type PK = number | string;

export class APIRepository {
  api: IAPI;
  serializer: ISerializer;
  requestContextBuilder = new RequestContextBuilder();

  public async create(
    raw: Parameters<this['serializer']['toDTO']>[0],
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(raw);
    const context = this.requestContextBuilder.create(config, { data })
    const response = await this.api.create(context);
    return this.serializer.fromDTO(response);
  }

  public async get(
    pk: number,
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const context = this.requestContextBuilder.create(
      { urlParams: { pk } },
      config
    );
    const response = await this.api.get(context);
    return this.serializer.fromDTO(response);
  }

  public async list(
    page = 1,
    config: Partial<RequestContext> = {}
  ) {
    type SerializedItem = ReturnType<this['serializer']['fromDTO']>
    const context = this.requestContextBuilder.create({ pagination: { page } }, config)
    const { items, ...meta } = await this.api.list(context) as Awaited<ReturnType<this['api']['list']>>
    const serializedItems = items.map(this.serializer.fromDTO) as SerializedItem[]
    return [serializedItems, meta] as [SerializedItem[], typeof meta]
  }

  public async update(
    pk: PK,
    diff: Partial<Parameters<this['serializer']['toDTO']>[0]>,
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(diff);
    const context = this.requestContextBuilder.create(
      { urlParams: { pk }, data }, config,
    )
    const response = await this.api.update(context);
    return this.serializer.fromDTO(response);
  }

  public async delete(
    pk: PK,
    config: Partial<RequestContext> = {}
  ) {
    const context = this.requestContextBuilder.create(
      { urlParams: { pk } }, config,
    )
    await this.api.delete(context);
  }
}
