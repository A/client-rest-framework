import { RequestContext } from './RequestContextBuilder';
import { GetFun, result } from './utils';

interface UrlBuilderConstructorOptions {
  /** If true, adds slash into detail api url */
  appendSlash: boolean
  url: GetFun<string>
}


export class UrlBuilder {
  options = {
    appendSlash: true,
  }

  url: GetFun<string> = ""

  constructor(options: Partial<UrlBuilderConstructorOptions> = {}) {
    if (!options.url) {
      throw new Error("`url` is required");
    }

    this.url = options.url

    if (typeof options.appendSlash !== "undefined") {
      this.options.appendSlash = options.appendSlash
    }
  }

  getUrl = () => result(this.url).replace(/\/$/, "");

  protected createSearchParams = (queryParams?: Record<string, any>) => {
    if (!queryParams) {
      return ""
    }
    return new URLSearchParams(queryParams).toString()
  }

  /**
   * Builds an url points against a collection (create, list)
   */
  private buildCollectionURL = (context: RequestContext) => {
    const tailingSlash = this.options.appendSlash ? "/" : ""
    const baseUrl = this.getUrl()
    const qs = this.createSearchParams(context.queryParams)
    return qs.length > 0
      ? `${baseUrl}/?${qs.toString()}`
      : `${baseUrl}${tailingSlash}`
  }

  /**
   * Builds an url points against a concrete item (update, patch, delete)
   */
  private buildItemURL = (context: RequestContext) => {
    const tailingSlash = this.options.appendSlash ? "/" : ""
    const baseUrl = this.getUrl()
    const qs = this.createSearchParams(context.queryParams)

    const pk = context.urlParams?.pk

    if (typeof pk === "undefined") {
      throw new Error("Concrete item URL can't be built without `pk`");
    }

    return qs.length > 0
      ? `${baseUrl}/${pk}/?${qs.toString()}`
      : `${baseUrl}/${pk}${tailingSlash}`
  }

  /**
   * Build url for a create request
   */
  public buildCreateURL = (context: RequestContext) => {
    return this.buildCollectionURL(context)
  }

  /**
   * Build url for a list request
   */
  public buildListURL = (context: RequestContext) => {
    return this.buildCollectionURL(context)
  }

  /**
   * Build url for a get request
   */
  public buildGetURL = (context: RequestContext) => {
    return this.buildItemURL(context)
  }

  /**
   * Build url for a delete request
   */
  public buildDeleteURL = (context: RequestContext) => {
    return this.buildItemURL(context)
  }

  /**
   * Build url for a update request
   */
  public buildUpdateURL = (context: RequestContext) => {
    return this.buildItemURL(context)
  }
}
