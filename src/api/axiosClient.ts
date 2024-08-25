import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import debug from 'debug';

const log = debug('app:services:http-client');

export class AxiosHTTPClient {
  private api: AxiosInstance;

  baseURL: string;

  constructor(opts: { baseURL: string }) {
    this.baseURL = opts.baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.onUnauthenticate();
        }
        return Promise.reject(error);
      }
    );
  }

  getExtraHeaders(): Record<string, string> {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUnauthenticate = () => {};

  public get<T>(uri: string, config?: AxiosRequestConfig) {
    log(`Get ${uri} with config`, config);
    return this.api.get<T>(uri, { headers: this.getExtraHeaders(), ...config });
  }

  public post<T>(uri: string, data?: unknown, config: AxiosRequestConfig = {}) {
    log(`Post ${uri} with data ${JSON.stringify(data)}`);
    return this.api.post<T>(uri, data, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getExtraHeaders(),
      }
    });
  }

  public patch<T>(uri: string, data?: unknown) {
    log(`Patch ${uri} with data ${JSON.stringify(data)}`);
    return this.api.patch<T>(uri, data, { headers: this.getExtraHeaders() });
  }

  public put<T>(uri: string, data?: unknown) {
    log(`Put ${uri} with data ${JSON.stringify(data)}`);
    return this.api.put<T>(uri, data, { headers: this.getExtraHeaders() });
  }

  public delete<T = void>(uri: string, config: AxiosRequestConfig = {}) {
    log(`Delete ${uri}`);
    return this.api.delete<T>(uri, {
      ...config,
      headers: this.getExtraHeaders(),
    });
  }
}
