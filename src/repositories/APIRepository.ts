import { api } from '..';
import { RequestContext } from '../types/RequestContext';

export interface WithPagination<T> {
  results: T[];
  count: number;
}

interface SerializerInterface {
  many: boolean;
  readonly: boolean;

  fromDTO: (arg: any) => any;
  toDTO: (arg: any) => any;
}


type Apply<T, K> = T<K>;

type FromDTO<T extends SerializerInterface> = ReturnType<T['fromDTO']>[]

interface PaginationInterface {
  onResponse: (data: any) => any;
}

export class APIRepository<DTOItem> {
  protected api: api.RESTAPI<DTOItem>;
  serializer: SerializerInterface;
  pagination: PaginationInterface | null = null;

  public async create(
    raw: Parameters<this['serializer']['toDTO']>[0],
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(raw);
    const context = this.api.createRequestContext(config, { data })
    const response = await this.api.create(context);
    return this.serializer.fromDTO(response);
  }

  public async get(
    pk: number,
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const context = this.api.createRequestContext(
      { urlParams: { pk } },
      config
    );
    const response = await this.api.get(context);
    return this.serializer.fromDTO(response);
  }

  public async list(
    config: Partial<RequestContext> = {}
  ): Promise<
    this["pagination"] extends null
      ? FromDTO<this['serializer']>[]
      : ReturnType<Apply<this["pagination"]["onResponse"], FromDTO<this["serializer"]>>>
  > {
    const context = this.api.createRequestContext(config)
    const response = await this.api.list(context);
    return response.map(this.serializer.fromDTO);
  }

  public async update(
    pk: number,
    diff: Partial<Parameters<this['serializer']['toDTO']>[0]>,
    config: Partial<RequestContext> = {}
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(diff);
    const context = this.api.createRequestContext(
      { urlParams: { pk }, data }, config,
    )
    const response = await this.api.update(context);
    return this.serializer.fromDTO(response);
  }

  public async delete(
    pk: number,
    config: Partial<RequestContext> = {}
  ) {
    const context = this.api.createRequestContext(
      { urlParams: { pk } }, config,
    )
    await this.api.delete(context);
  }
}
