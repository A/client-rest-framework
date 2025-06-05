import { RequestContextBuilder } from '../lib/RequestContextBuilder';

import { IAPI, ISerializer } from './types';

export class BaseRepository {
  api!: IAPI;
  serializer!: ISerializer;
  protected requestContextBuilder = new RequestContextBuilder();
}
