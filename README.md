# client-rest-framework

[![Build and Test](https://github.com/A/client-rest-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/A/client-rest-framework/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/client-rest-framework.svg)](https://badge.fury.io/js/client-rest-framework)

WORK IN PROGRESS.

# Introduction

The `client-rest-framework` is a Typescript library that allows developers to create repositories to manage entities in a few lines of code, in a style similar to Django REST framework. The library provides APIs, serializers, and repositories that make it easy to interact with RESTful APIs and manage entities in a structured and efficient manner.


## Features

- Powerful and flexible two-directional serializers for creating your own serialization and deserialization logic.
- Support for custom serializers to tailor serialization to your specific needs.
- Strongly-typed entities based on the defined serializers, providing type safety and avoiding common errors.
- Built-in support for Axios API, with the ability to easily customize and use custom API classes.
- Object-oriented design inspired by Django REST framework, making it easy to manage entities in a structured and efficient manner.

# Installation

To install the `client-rest-framework`, run the following command:

`npm install client-rest-framework`

# Usage

To use the library, you need to import the `repositories` and `serializers` modules from the `client-rest-framework` package, and define your API endpoints, serializers, and repositories.

## API

To define an API, create a class that extends the `RESTAPI` class, provide an `HTTPClient` instance, and set the `url` property to the API endpoint URL. You can then pass this API to an `ApiRepository` as a realization of CRUD operations for the corresponding entity.

Example API class:

```typescript
import { api, pagination } from "client-rest-framework";
import { PublicUserDTO } from "./types"; 

// Configure HTTPClient
class HTTPClient extends api.AxiosHTTPClient {
  getExtraHeaders() {
    return { Authorization: `Bearer ${access}` };
  }

  onUnauthenticate = () => {
    return;
  }
}

class API<T> extends api.RESTAPI<T> {
  client = new HTTPClient({
    baseURL: BASE_URL
  });
}

class PublicUserAPI extends API<PublicUserDTO> {
  pagination = pagination.PageNumberPagination<PublicUserDTO>()
  url = "/api/users";
}
```

## Serializers

Serializers are two-directional data-mappers that help to explicitly describe the domain model and to enforce its types in a simple case.

To define a serializer, create a class that extends the `ModelSerializer` class, and define fields for each attribute of the corresponding entity. You can use the `StringField`, `NumberField`, `BooleanField`, `DateField`, and `EnumField` classes to define different types of fields.

Example serializer class:

```typescript
import { serializers } from "client-rest-framework"; 
import { PublicUserDTO, RoleKey, UserStatusKey, CategoryKey } from "./types";  

export class PublicUserSerializer extends ModelSerializer<PublicUserDTO> {
  id = new serializers.NumberField({ readonly: true });
  username = new serializers.StringField({ readonly: true });
  email = new serializers.StringField({ readonly: true });
  display_name = new serializers.StringField({ readonly: true });
  date_joined = new serializers.DateField({ readonly: true });
  notes = new serializers.StringField({ many: true, optional: true });
  phone = new serializers.StringField({ optional: true });
  // TS limutation, in this case you need to pass T, Readonly, Many and Optional generics explicitly, if their value isn't 'false':
  roles = new serializers.EnumField<RoleKey, false, true>({ many: true });
  status = new serializers.EnumField<UserStatusKey>();
  categories = new serializers.EnumField<CategoryKey, false, true, true>({ many: true, optional: true });
}
```

The library supports inferring the resulting domain type from the serializer class using the `ReturnType` type operator. You can use this to get the type of the entity returned by the repository's methods.

Example:

```typescript
export type PublicUser = ReturnType<PublicUserSerializer["fromDTO"]>
```

## Repositories

To define a repository, create a class that extends the `APIRepository` class, and set the `api` property to an instance of the corresponding API class, and the `serializer` property to an instance of the corresponding serializer class.

Example repository class:

```typescript
import { repositories } from "client-rest-framework"; 
import { PublicUserDTO } from "./types";
import { PublicUserAPI } from "./api";
import { PublicUserSerializer } from "./serializers";

export class PublicUserApiRepository extends repositories.APIRepository {
  api = new PublicUserAPI();
  serializer = new PublicUserSerializer();
}
```

## Using the repository

You can now use the repository to interact with the API and manage entities.

Example usage:

```typescript
import { PublicUserApiRepository } from "./repositories";
import { PublicUser } from "./types";

const publicUsersRepository = new PublicUserApiRepository();  


// Get a user by ID 
const user = await publicUsersRepository.get(1);

// List all users
const users = await publicUsersRepository.list();

// Create a new user
const user = await publicUsersRepository.create(data);

// update a user
const user = await publicUsersRepository.update(1, diff);

// delete a user
await repo.delete(1);
```

## Important Notes and Limitations

- So far, list method works only with `rest_framework.pagination.PageNumberPagination` and expects this setting to be configured in DRF.
- Package is in early alpha, interfaces may change
