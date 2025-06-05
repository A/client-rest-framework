import { BaseSerializer } from './BaseSerializer';

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
}[Exclude<keyof T, 'toDTO' | 'fromDTO' | 'readonly' | 'many' | 'optional'>];

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
};

type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;

type SerializedDTOResult<Serializer extends Record<string, any>> =
  NoUndefinedField<{
    [Key in KnownKeys<Serializer>]: Serializer[Key]['readonly'] extends true
      ? undefined
      : Serializer[Key]['many'] extends true
      ? Serializer[Key]['optional'] extends true
        ? ReturnType<Serializer[Key]['fromDTO']>[] | null
        : ReturnType<Serializer[Key]['fromDTO']>[]
      : Serializer[Key]['optional'] extends true
      ? ReturnType<Serializer[Key]['fromDTO']> | null
      : ReturnType<Serializer[Key]['fromDTO']>;
  }>;

type SerializedModelResult<Serializer extends Record<string, any>> = {
  [Key in KnownKeys<Serializer>]: Serializer[Key]['many'] extends true
    ? Serializer[Key]['optional'] extends true
      ? ReturnType<Serializer[Key]['fromDTO']>[] | null
      : ReturnType<Serializer[Key]['fromDTO']>[]
    : Serializer[Key]['optional'] extends true
    ? ReturnType<Serializer[Key]['fromDTO']> | null
    : ReturnType<Serializer[Key]['fromDTO']>;
};

export type ToDTOPayload<Serializer extends Record<string, any>> = OmitByValue<
  {
    [Key in KnownKeys<Serializer>]: Serializer[Key]['readonly'] extends true
      ? undefined
      : Serializer[Key]['many'] extends true
      ? Serializer[Key]['optional'] extends true
        ? ReturnType<Serializer[Key]['fromDTO']>[] | null | undefined
        : ReturnType<Serializer[Key]['fromDTO']>[]
      : Serializer[Key]['optional'] extends true
      ? ReturnType<Serializer[Key]['fromDTO']> | null | undefined
      : ReturnType<Serializer[Key]['fromDTO']>;
  },
  undefined
>;

export class ModelSerializer<
  DTOItem = Record<string, any>,
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false
> extends BaseSerializer<R, M> {
  public fromDTO = (data: DTOItem): SerializedModelResult<this> => {
    const result: any = {};
    for (const key in data) {
      if (!this[key as keyof this]) {
        console.warn(
          `${this.constructor.name} received a strange key \`${key}\` without any serializer configured`
        );
        continue;
      }
      const serializer = this[key as keyof this] as BaseSerializer<R, M, O>;
      if (serializer.many) {
        result[key] = (data[key] as any).map(serializer.fromDTO);
        continue;
      }
      result[key] = serializer.fromDTO(data[key]);
    }
    return result;
  };

  public toDTO = (data: ToDTOPayload<this>): SerializedDTOResult<this> => {
    const result: any = {};
    for (const key in data) {
      const serializer = this[key as keyof this] as BaseSerializer<R, M, O>;

      if (!serializer) {
        console.warn(`Serializer hasn't been found for field "${key}"`);
        continue;
      }

      if (serializer.readonly) {
        continue;
      }

      if (serializer.many) {
        // @ts-ignore
        result[key] = data[key].map(serializer.toDTO);
        continue;
      }

      // @ts-ignore
      result[key] = serializer.toDTO(data[key]);
    }
    return result;
  };
}
