<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## TODO: Add userTypeInfo in jwtPayload
## TODO: TODOS LOS SERVICIOS DE ACTUALIZACION DE ARTISTAS DEBEN RESPONDER LO MISMO, SI ACTUALIZO UNA IMAGEN O UN STUDIO O UN SERVICIO ME DEBE RETORNAR EL ARISTA COMPLETO SIEMPRE 

# Inker Backend API Documentation

This document provides a detailed guide to the Stencil and Work API endpoints, which are divided into two main sections:

1. **Artist Management Endpoints**: For artists to create, read, update, and delete their stencils and works.
2. **Search Endpoints**: For customers to search and discover stencils and works across the platform.

## Table of Contents

- [Artist Management Endpoints](#artist-management-endpoints)
  - [Stencil Management](#stencil-management)
  - [Work Management](#work-management)
- [Search Endpoints](#search-endpoints)
  - [Stencil Search](#stencil-search)
  - [Work Search](#work-search)

## Artist Management Endpoints

These endpoints are designed for artists to manage their own stencils and works.

### Stencil Management

#### Get Stencils by Artist ID

```
GET /stencils/artist/:artistId
```

Retrieves a paginated list of stencils belonging to a specific artist.

**Parameters:**
- `artistId` (path): Artist ID
- Query parameters (via `StencilQueryDto`):
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Field to sort by
  - `sortOrder` (optional): 'ASC' or 'DESC'

**Response:** `PaginatedStencilResponseDto` containing stencil items and pagination metadata

#### Get Stencil by ID

```
GET /stencils/:id
```

Retrieves a specific stencil by its ID.

**Parameters:**
- `id` (path): Stencil ID

**Response:** `StencilDto` with complete stencil information

#### Create Stencil

```
POST /stencils
```

Creates a new stencil. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Request Body:** `CreateStencilDto` (multipart/form-data)
- Text fields for stencil data
- `file`: Stencil image file

**Response:** Created `StencilDto`

#### Update Stencil

```
PUT /stencils/:id
```

Updates an existing stencil. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Parameters:**
- `id` (path): Stencil ID

**Request Body:** `UpdateStencilDto`

**Response:** Updated `StencilDto`

#### Delete Stencil

```
DELETE /stencils/:id
```

Deletes a stencil. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Parameters:**
- `id` (path): Stencil ID

**Response:** Empty response with status 200

### Work Management

#### Get Works by Artist ID

```
GET /works/artist/:artistId
```

Retrieves a paginated list of works belonging to a specific artist.

**Parameters:**
- `artistId` (path): Artist ID
- Query parameters (via `WorkQueryDto`):
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Field to sort by
  - `sortOrder` (optional): 'ASC' or 'DESC'

**Response:** `PaginatedWorkResponseDto` containing work items and pagination metadata

#### Get Work by ID

```
GET /works/:id
```

Retrieves a specific work by its ID.

**Parameters:**
- `id` (path): Work ID

**Response:** `WorkDto` with complete work information

#### Create Work

```
POST /works
```

Creates a new work. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Request Body:** `CreateWorkDto` (multipart/form-data)
- Text fields for work data
- `file`: Work image file

**Response:** Created `WorkDto`

#### Update Work

```
PUT /works/:id
```

Updates an existing work. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Parameters:**
- `id` (path): Work ID

**Request Body:** `UpdateWorkDto`

**Response:** Updated `WorkDto`

#### Delete Work

```
DELETE /works/:id
```

Deletes a work. Requires authentication.

**Headers:**
- Authorization: Bearer token

**Parameters:**
- `id` (path): Work ID

**Response:** Empty response with status 200

## Search Endpoints

These endpoints are designed for customers to search and discover stencils and works across the platform.

### Stencil Search

#### Search Stencils

```
GET /stencil-search
```

Advanced search for stencils with multiple criteria.

**Query Parameters** (via `StencilSearchQueryDto`):
- `query` (optional): Search text
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: 'relevance', options: 'relevance', 'newest', 'popularity')
- `tags` (optional): Array of tag IDs to filter by
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `artistId` (optional): Filter by artist ID

**Response:** `PaginatedStencilResponseDto` with relevance scoring

#### Get Ranking Information

```
GET /stencil-search/ranking-info
```

Returns information about how search relevance is calculated for stencils.

**Response:** Array of ranking factors with descriptions and weights

#### Get Tag Suggestions

```
GET /stencil-search/tags/suggest
```

Returns tag suggestions based on a prefix for autocomplete functionality.

**Query Parameters:**
- `prefix` (required): The prefix to search for tags
- `limit` (optional): Maximum number of suggestions to return

**Response:** Array of `TagSuggestionResponseDto` objects

#### Get Popular Tags

```
GET /stencil-search/tags/popular
```

Returns the most popular tags for stencils.

**Query Parameters:**
- `limit` (optional): Maximum number of tags to return (default: 10)

**Response:** Array of `TagSuggestionResponseDto` objects

### Work Search

#### Search Works

```
GET /work-search
```

Advanced search for works with multiple criteria.

**Query Parameters** (via `WorkSearchQueryDto`):
- `query` (optional): Search text
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: 'relevance', options: 'relevance', 'newest', 'popularity')
- `tags` (optional): Array of tag IDs to filter by
- `artistId` (optional): Filter by artist ID

**Response:** `PaginatedWorkResponseDto` with relevance scoring

#### Get Ranking Information

```
GET /work-search/ranking-info
```

Returns information about how search relevance is calculated for works.

**Response:** Array of ranking factors with descriptions and weights

#### Get Tag Suggestions

```
GET /work-search/tags/suggest
```

Returns tag suggestions for works based on a prefix for autocomplete functionality.

**Query Parameters:**
- `prefix` (required): The prefix to search for tags
- `limit` (optional): Maximum number of suggestions to return

**Response:** Array of `WorkTagSuggestionResponseDto` objects

#### Get Popular Tags

```
GET /work-search/tags/popular
```

Returns the most popular tags for works.

**Query Parameters:**
- `limit` (optional): Maximum number of tags to return (default: 10)

**Response:** Array of `WorkTagSuggestionResponseDto` objects

## Implementation Notes for AI Frontend Development

When developing a frontend for this API, consider the following:

1. **User Role Differentiation**:
   - Artist interfaces should focus on CRUD operations using the Artist Management endpoints
   - Customer interfaces should focus on discovery using the Search endpoints

2. **Authentication**:
   - All creation, update, and deletion operations require authentication via Bearer token
   - Search operations do not require authentication

3. **File Uploads**:
   - Both stencil and work creation require file uploads using multipart/form-data

4. **Search Experience**:
   - Implement autocomplete for tags using the tag suggestion endpoints
   - Display relevance factors for search results to improve user understanding
   - Implement filters based on the available search parameters

5. **Pagination**:
   - All list endpoints return paginated responses
   - Implement proper pagination controls in the UI

6. **Sorting Options**:
   - Provide UI controls for the various sorting options ('relevance', 'newest', 'popularity')

7. **Image Handling**:
   - The API returns image URLs that should be displayed in the frontend
   - Consider implementing image optimization and caching strategies

By following these guidelines, an AI can effectively implement a frontend that interacts with this backend API, providing different experiences for artists and customers.
