export class NoPagination<DTO> {
  cast(data: any) {
    return { items: data as DTO[] };
  }
}
