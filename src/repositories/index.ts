import { BaseRepository } from './BaseRepository';
import { CreateMixin } from './CreateMixin';
import { DestroyMixin } from './DestroyMixin';
import { ListMixin } from './ListMixin';
import { RetrieveMixin } from './RetrieveMixin';
import { UpdateMixin } from './UpdateMixin';
import { IAPI, ISerializer } from './types';

abstract class ReadOnlyRepository extends ListMixin(
  RetrieveMixin(BaseRepository)
) {
  abstract api: IAPI;
  abstract serializer: ISerializer;
}

abstract class CreateOnlyRepository extends CreateMixin(BaseRepository) {
  abstract api: IAPI;
  abstract serializer: ISerializer;
}

abstract class ListOnlyRepository extends ListMixin(BaseRepository) {
  abstract api: IAPI;
  abstract serializer: ISerializer;
}

abstract class RetrieveOnlyRepository extends RetrieveMixin(BaseRepository) {
  abstract api: IAPI;
  abstract serializer: ISerializer;
}

abstract class ModelRepository extends DestroyMixin(
  UpdateMixin(ListMixin(RetrieveMixin(CreateMixin(BaseRepository))))
) {
  abstract api: IAPI;
  abstract serializer: ISerializer;
}

const mixins = {
  CreateMixin,
  DestroyMixin,
  ListMixin,
  RetrieveMixin,
  UpdateMixin,
};

export {
  mixins,
  BaseRepository,
  ModelRepository,
  ModelRepository as APIRepository,
  ReadOnlyRepository,
  CreateOnlyRepository,
  ListOnlyRepository,
  RetrieveOnlyRepository,
};
