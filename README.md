# client-rest-framework

[![Build and Test](https://github.com/A/client-rest-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/A/client-rest-framework/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/client-rest-framework.svg)](https://badge.fury.io/js/client-rest-framework)

**WORK IN PROGRESS**

## Table of Contents

* [Introduction](#introduction)
* [Installation](#installation)
* [Quick Start](#quickstart)
* [API](#api)
* [Serializers](#serializers)
* [Repository](#repository)
* [Repository Types](#repositorytypes)

## Introduction

`client-rest-framework` is a **TypeScript** library that lets you build repositories to manage entities with just a few lines of code—using patterns familiar to Django REST framework. It ships APIs, serializers, and repositories that make it straightforward to interact with RESTful back‑ends in a structured, type‑safe way.

### Features

* Powerful, flexible **two‑directional serializers** for custom serialisation and deserialisation logic.
* Support for **custom serializers** so you can tailor mapping to your exact needs.
* **Strongly‑typed entities** derived from serializers, providing compile‑time safety and avoiding common errors.
* Built‑in support for an **Axios‑based HTTP client**, with hooks for headers and error handling.
* **Object‑oriented design** inspired by Django REST framework.
* **Composable repositories**—include only the operations you need (read‑only, write‑only, or your own mix).

## Installation

```bash
npm install client-rest-framework
```

## Quick Start

```ts
import { api, serializers, repositories, pagination } from "client-rest-framework";

// 1. HTTP client
class HTTPClient extends api.AxiosHTTPClient {
  getExtraHeaders() {
    return { Authorization: `Bearer ${access}` };
  }

  // Called when the backend responds with 401
  onUnauthenticate = () => {
    logout();
  };
}

// 2. Base API class
class API<T> extends api.RESTAPI<T> {
  options = { appendSlash: true };
  pagination = new pagination.PageNumberPagination<T>({ pageSize: PAGE_SIZE });
  client = new HTTPClient({ baseURL: BASE_URL });
}

// 3. Endpoint‑specific API
class PublicUserAPI extends API<PublicUserDTO> {
  pagination = new pagination.PageNumberPagination<PublicUserDTO>();
  url = "/api/users";
}

// 4. Serializer
class PublicUserSerializer extends serializers.ModelSerializer<PublicUserDTO> {
  id           = new serializers.NumberField();
  username     = new serializers.StringField();
  email        = new serializers.StringField();
  display_name = new serializers.StringField();
  date_joined  = new serializers.DateField();
}

// 5. Repository
class PublicUserRepository extends repositories.ReadOnlyRepository {
  api        = new PublicUserAPI();
  serializer = new PublicUserSerializer();
}

// 6. Usage
const users = new PublicUserRepository();
const userList = await users.list();
const user = await users.get(1);
```

## API

Create an API class by extending `RESTAPI`, injecting an `HTTPClient`, and setting the `url` field. The API class can then be passed to a repository to realise CRUD operations.

```ts
import { api, pagination } from "client-rest-framework";
import { PublicUserDTO } from "./types";

class HTTPClient extends api.AxiosHTTPClient {
  getExtraHeaders() {
    return { Authorization: `Bearer ${access}` };
  }

  onUnauthenticate = () => {
    logout();
  };
}

class API<T> extends api.RESTAPI<T> {
  client = new HTTPClient({ baseURL: BASE_URL });
}

class PublicUserAPI extends API<PublicUserDTO> {
  pagination = new pagination.PageNumberPagination<PublicUserDTO>();
  url = "/api/users";
}
```

### API Pagination

Two pagination helpers are available:

```ts
// Returns [items: DTO[], { count: number }]
class NumberedAPI extends api.RESTAPI {
  pagination = new pagination.PageNumberPagination({
    pageSize: 50,
    pageSizeQueryParam: "page_size",
    pageQueryParam: "page",
  });
}

// Returns items untouched
class FlatAPI extends api.RESTAPI {
  pagination = new pagination.NoPagination();
}
```

## Serializers

Serializers map data **to and from** your domain model.

```ts
import { serializers } from "client-rest-framework";
import { PublicUserDTO, RoleKey, UserStatusKey, CategoryKey } from "./types";

export class PublicUserSerializer extends serializers.ModelSerializer<PublicUserDTO> {
  id           = new serializers.NumberField({ readonly: true });
  username     = new serializers.StringField({ readonly: true });
  email        = new serializers.StringField({ readonly: true });
  display_name = new serializers.StringField({ readonly: true });
  date_joined  = new serializers.DateField({ readonly: true });

  notes      = new serializers.StringField({ many: true, optional: true });
  phone      = new serializers.StringField({ optional: true });
  roles      = new serializers.EnumField<RoleKey, false, true>({ many: true });
  status     = new serializers.EnumField<UserStatusKey>();
  categories = new serializers.EnumField<CategoryKey, false, true, true>({ many: true, optional: true });
}
```

### Inferring Types

```ts
type Domain<T extends { fromDTO: (...a: never[]) => any }> = ReturnType<T["fromDTO"]>;
type Payload<T extends { toDTO: (...a: never[]) => any }> = Parameters<T["toDTO"]>[0];

export type PublicUser        = Domain<PublicUserSerializer>;
export type PublicUserPayload = Payload<PublicUserSerializer>;
```

### Custom Serializers

Create bespoke mappings when you need defaults or complex structures:

```ts
export class TemplateSerializer<R extends boolean = false, M extends boolean = false>
  extends serializers.BaseSerializer<R, M> {

  fromDTO = (data: string | null) =>
    (typeof data === "string" ? data : DEFAULT_RESUME_TEMPLATE) as ResumeTemplateKey;

  toDTO = (data: ResumeTemplateKey) => data;
}
```

```ts
export interface ImageStruct {
  file2x : string;
  file  : string;
  thumb : string;
  thumb2x: string;
}

export class ImageSerializer<R extends boolean = false, M extends boolean = false>
  extends serializers.BaseSerializer<R, M> {

  private static EXT = ".webp";

  fromDTO = (filename: string): ImageStruct => {
    const id = filename.split(".")[0];
    return {
      file2x : `${id}_2x${ImageSerializer.EXT}`,
      file   : `${id}${ImageSerializer.EXT}`,
      thumb  : `${id}_t${ImageSerializer.EXT}`,
      thumb2x: `${id}_t2x${ImageSerializer.EXT}`,
    };
  };

  toDTO = (image: ImageStruct | string) =>
    typeof image === "string" ? image : image.file;
}
```

### Nested Serializers

```ts
class ResumeMinimalSerializer<R extends boolean = false, M extends boolean = false>
  extends serializers.ModelSerializer<any, R, M> {
  id         = new serializers.StringField({ readonly: true });
  updated_at = new serializers.DateField({ readonly: true });
}

export class ApplicationSerializer<R extends boolean = false, M extends boolean = false>
  extends serializers.ModelSerializer<ApplicationDTO, R, M> {
  id       = new serializers.NumberField({ readonly: true });
  position = new serializers.StringField();
  company  = new serializers.StringField();
  resumes  = new ResumeMinimalSerializer({ readonly: true, many: true });
}
```

## Repository

Define a repository by extending one of the provided classes and wiring in an `api` and a `serializer`.

### Basic Usage

```ts
import { repositories } from "client-rest-framework";
import { PublicUserAPI } from "./api";
import { PublicUserSerializer } from "./serializers";

// Read‑only (get & list)
export class PublicUserRepository extends repositories.ReadOnlyRepository {
  api        = new PublicUserAPI();
  serializer = new PublicUserSerializer();
}

// Full CRUD
export class AdminUserRepository extends repositories.ModelRepository {
  api        = new PublicUserAPI();
  serializer = new PublicUserSerializer();
}
```

### Using the Repository

```ts
const users = new PublicUserRepository();

// Get a user
const user = await users.get(1);

// List users (page 1)
const [list, { count }] = await users.list(1);

// Full CRUD example
const admin = new AdminUserRepository();
const created = await admin.create(data);
const updated = await admin.update(1, diff);
await admin.delete(1);
```

### Query Parameters

```ts
const [articles] = await articlesRepository.list(1, {
  queryParams: {
    page_size : 20,
    author    : 42,
    rating_min: 5,
  },
});
```

## Repository Types

Choose a predefined repository class—or compose your own—to control allowed operations.

| Repository               | Methods                           | Typical Use                    |
| ------------------------ | --------------------------------- | ------------------------------ |
| `ModelRepository`        | create, get, list, update, delete | Full admin control             |
| `ReadOnlyRepository`     | get, list                         | Public APIs, documentation     |
| `ListOnlyRepository`     | list                              | Dropdowns, catalogues, search  |
| `CreateOnlyRepository`   | create                            | Logging, analytics, write‑only |
| `RetrieveOnlyRepository` | get                               | Detail pages                   |

### Custom Compositions

```ts
import { repositories } from "client-rest-framework";

class BulkCleanupRepository extends repositories.mixins.DestroyMixin(
  repositories.mixins.ListMixin(repositories.BaseRepository),
) {
  api        = new CleanupAPI();
  serializer = new ItemSerializer();
}
```

## Important Notes and Limitations

* `list()` currently supports **DRF PageNumberPagination** only.
* The package is in early alpha—APIs may change.
