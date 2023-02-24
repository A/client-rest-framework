/**
 * Mobi is a try to make some sort of an data adapter to DRF in the quite same OOP way.
 *
 *
 * TODO:
 * - [ ] Basic API Class supports tokens, can be initialized just by one url
 * - [ ] Pagination support
 * - [ ] Nested routers support
 * - [ ] Errors
 */
export * as serializers from './serializers';
export * as api from './api';
export * as repositories from './repositories';
//
//
// interface APIRequest<T extends any> {
//   urlParams?: Record<string, string | number>
//   queryParams?: Record<string, string | number | boolean>;
//   data?: T;
//   pagination?: PaginationContext
// }
//
// interface PaginationContext {
//   page: number
// }
//
// export interface APIInterface<T extends any = any> {
//   get(r: APIRequest<T>): Promise<T>
//   create(r: APIRequest<T>): Promise<T>
//   list(r: APIRequest<T>): Promise<T[]>
//   update(r: APIRequest<T>): Promise<T>
//   delete(r: APIRequest<T>): Promise<void>
// }
//
//
// export class APIRepository<DTOItem> {
//   protected api: APIInterface<DTOItem>;
//   serializer: SerializerInterface<DTOItem>;
//
//   public async create(
//     raw: Parameters<this["serializer"]["toDTO"]>[0]
//   ): Promise<ReturnType<this["serializer"]["fromDTO"]>> {
//     const data = this.serializer.toDTO(raw)
//     const response = await this.api.create({ data });
//     return this.serializer.fromDTO(response)
//   }
//
//   public async get(pk: number): Promise<ReturnType<this["serializer"]["fromDTO"]>> {
//     const response = await this.api.get({ urlParams: { pk }});
//     return this.serializer.fromDTO(response)
//   }
//
//   public async list(page: number = 1): Promise<[ReturnType<this["serializer"]["fromDTO"]>]> {
//     const response = await this.api.list({ pagination: { page } });
//     // @ts-ignore
//     return response.results.map(this.serializer.fromDTO) as any
//   }
//
//   public async update(
//     pk: number,
//     raw: Partial<Parameters<this["serializer"]["toDTO"]>[0]>
//   ): Promise<ReturnType<this["serializer"]["fromDTO"]>> {
//     const data = this.serializer.toDTO(raw)
//
//     const response = await this.api.update({
//       urlParams: { pk },
//       data,
//     })
//     return this.serializer.fromDTO(response)
//   }
//
//   public async delete(pk: number) {
//     return await this.api.delete({ urlParams: { pk } });
//   }
// }
