import merge from 'lodash.merge';

export interface RequestContext {
  urlParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean>;
  data?: any;
  pagination?: Record<string, any>;
}


/**
 * This class is responsible for building universal
 * request context, which can be processed by API
 * and converted to an HTTPClient call.
 *
 * TODO: Current implementation is attached to axios and should be refactored
 */
export class RequestContextBuilder {

  private createDefaultContext = () => {
    return {
      urlParams: {},
      queryParams: {},
      pagination: {},
      data: null,
    }
  }

  create = (...contexts: Partial<RequestContext>[]) => {
    const defaultContext = this.createDefaultContext()
    return merge(defaultContext, ...contexts) as RequestContext;
  }
}
