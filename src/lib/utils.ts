export type GetFun<T> = T | (() => T);

export const result = <T = any>(wrapped: GetFun<T>): T => {
  return typeof wrapped === 'function'
    ? (wrapped as () => T)()
    : wrapped;
};

