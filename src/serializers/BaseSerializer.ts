/**
 * Base serializer implements ability to set serializer options,
 * such as many
 */
export class BaseSerializer<
  R extends boolean = false,
  M extends boolean = false,
  O extends boolean = false,
> {
  readonly readonly: R;
  readonly many: M;
  readonly optional: O;

  constructor(
    options: {
      /** Ignore serialized property in requests to a server */
      readonly?: R;
      /** Apply serializer to an array of values */
      many?: M;
      /** Nullable field */
      optional?: O;
    } = {}
  ) {
    Object.assign(this, { many: false, readonly: false, optional: false }, options);
  }

  /** Converts data transfer objects into models */
  public fromDTO = (data: any): any => {
    return data;
  };

  /** Converts model into data transfer objects */
  public toDTO = (data: any): any => {
    return data;
  };
}
