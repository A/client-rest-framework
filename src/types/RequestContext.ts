export interface RequestContext {
  urlParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean>;
  data?: any;
  pagination?: Record<string, any>;
}

