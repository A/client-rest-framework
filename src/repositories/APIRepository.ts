import { api } from '..';

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

export class APIRepository<DTOItem> {
  protected api: api.APIInterface<DTOItem>;
  serializer: SerializerInterface;

  public async create(
    raw: Parameters<this['serializer']['toDTO']>[0]
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(raw);
    const response = await this.api.create({ data });
    return this.serializer.fromDTO(response);
  }

  public async get(
    pk: number
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const response = await this.api.get({ urlParams: { pk } });
    return this.serializer.fromDTO(response);
  }

  public async list(
    page = 1,
    queryParams?: Record<string, any>
  ): Promise<WithPagination<ReturnType<this['serializer']['fromDTO']>>> {
    const response = (await this.api.list({
      pagination: { page },
      queryParams,
    })) as any;
    // @ts-ignore
    return {
      ...response,
      results: response.results.map(this.serializer.fromDTO),
    } as any;
  }

  public async update(
    pk: number,
    raw: Partial<Parameters<this['serializer']['toDTO']>[0]>
  ): Promise<ReturnType<this['serializer']['fromDTO']>> {
    const data = this.serializer.toDTO(raw);

    const response = await this.api.update({
      urlParams: { pk },
      data,
    });
    return this.serializer.fromDTO(response);
  }

  public async delete(pk: number) {
    await this.api.delete({ urlParams: { pk } });
  }
}
