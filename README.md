# client-rest-framework

WORK IN PROGRESS.

A framework to construct domain API repositories. Havily inspired by DRF ViewSets
and designed to have pretty close API to DRF. `client-rest-framework` provides
API-clients, serializers to build domain entity repositories in minutes.

## Features

- A collection of 2-direction serializers to create your own serialization
  and deserialization logic
- Support for custom serializers
- Correct types based on defined serializers
- Axios API from the box, and support for custom API classes
- OOP design (hello DRF)

## Example

```ts
import { repositories, serializers } from "client-api-framework";

import { API } from "./api";
import { CategoryKey, RoleKey, UserStatusKey } from "./types";

export interface PublicUserDTO {
  id: number;
  username: string;
  email: string;
  display_name: string;
  date_joined: string;
  notes: string;
  phone: string;
  roles: RoleKey[];
  status: UserStatusKey;
  categories: CategoryKey[];
}


// Example API supports get, create, update, list, delete methods against given URL
class PublicUserAPI extends API<PublicUserDTO> {
  url = "/api/users";
}

// Example serializer
export class PublicUserSerializer extends serializers.ModelSerializer<PublicUserDTO> {
  id = new serializers.NumberField({ readonly: true }),
  username = new serializers.StringField({ readonly: true })
  email = new serializers.StringField({ readonly: true })
  display_name = new serializers.StringField({ readonly: true })
  date_joined = new serializers.DateField({ readonly: true })
  notes = new serializers.StringField({})
  phone = new serializers.StringField({})
  // ts limitation, pass Readonly and Many generics manually
  roles = new serializers.EnumField<RoleKey, false, true>({ many: true })
  status = new serializers.EnumField<UserStatusKey, false, false>({})
  categories = new serializers.EnumField<CategoryKey, false, true>({ many: true })
}

// Example repository class
export class PublicUserApiRepository extends repositories.APIRepository<PublicUserDTO> {
  api = new PublicUserAPI();
  serializer = new PublicUserSerializer();
}

// Infer resulting domain type from serializers
export type PublicUser = ReturnType<PublicUserSerializer["fromDTO"]>

// Usage
const repo = new PublicUserApiRepository()
await repo.list() // list users
await repo.get(1) // get user
await repo.create(user) // create user
await repo.update(1, diff) // update user
await repo.delete(1) // delete user

```
