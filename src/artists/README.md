# Módulo de Artistas y Estenciles

Este módulo gestiona todo lo relacionado con artistas, sus trabajos y estenciles. Esta documentación se centra principalmente en la funcionalidad de estenciles, para facilitar la implementación del frontend tanto para la gestión como para la búsqueda de estenciles.

## Tabla de contenidos

1. [Estructura general](#estructura-general)
2. [API de búsqueda de estenciles](#api-de-búsqueda-de-estenciles)
3. [API de gestión de estenciles](#api-de-gestión-de-estenciles)
4. [Sistema de relevancia](#sistema-de-relevancia)
5. [Manejo de etiquetas (tags)](#manejo-de-etiquetas-tags)
6. [Guía de implementación para el frontend](#guía-de-implementación-para-el-frontend)
7. [Consideraciones de rendimiento](#consideraciones-de-rendimiento)

## Estructura general

El módulo sigue una arquitectura limpia y está estructurado en:

- **Domain**: Contiene DTOs, interfaces y tipos relacionados con artistas y estenciles
- **Usecases**: Lógica de negocio encapsulada en casos de uso
- **Infrastructure**: Implementaciones concretas (controladores, proveedores, entidades)

### Entidades principales

- `Artist`: Representa un artista tatuador
- `Stencil`: Representa un estencil (plantilla/diseño) para tatuajes
- `Work`: Representa trabajos/tatuajes realizados por el artista
- `Tag`: Etiquetas para categorizar estenciles

## API de búsqueda de estenciles

La API de búsqueda de estenciles ofrece una experiencia de búsqueda avanzada con múltiples criterios de filtrado, ordenamiento y sugerencias de etiquetas.

### Endpoints principales

#### `GET /stencil-search`

Realiza búsquedas avanzadas de estenciles utilizando múltiples criterios.

**Parámetros de consulta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| query | string | Término de búsqueda en texto libre |
| tagIds | number[] | IDs de etiquetas para filtrar |
| artistId | number | ID del artista para filtrar |
| onlyAvailable | boolean | Mostrar solo estenciles disponibles |
| sortBy | string | Tipo de ordenación: 'relevance', 'newest', 'oldest', 'popularity' |
| page | number | Número de página (empieza en 1) |
| limit | number | Número de resultados por página (máx. 50) |

**Respuesta:**

```json
{
  "items": [
    {
      "id": 1,
      "artistId": 123,
      "title": "Dragon tattoo",
      "description": "A beautiful dragon design",
      "imageUrl": "https://cdn.example.com/images/dragon.jpg",
      "thumbnailUrl": "https://cdn.example.com/images/thumbnails/dragon.jpg",
      "price": 50.0,
      "isAvailable": true,
      "createdAt": "2023-08-15T14:30:00Z",
      "updatedAt": "2023-08-15T14:30:00Z",
      "tags": [
        { "id": 1, "name": "dragon" },
        { "id": 2, "name": "asian" }
      ],
      "relevanceScore": 0.85,
      "relevanceFactors": ["title_exact_match", "recent", "available"]
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 45,
  "pages": 5
}
```

#### `GET /stencil-search/ranking-info`

Proporciona información detallada sobre cómo se calcula la relevancia en los resultados de búsqueda.

**Respuesta:**

```json
[
  {
    "factor": "title_exact_match",
    "description": "Coincidencia exacta del término de búsqueda en el título",
    "weight": 0.3
  },
  {
    "factor": "title_partial_match",
    "description": "Coincidencia parcial de palabras en el título",
    "weight": 0.2
  },
  // ... otros factores
]
```

#### `GET /stencil-search/tags/suggest`

Proporciona sugerencias de etiquetas a medida que el usuario escribe.

**Parámetros de consulta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| prefix | string | Prefijo para buscar etiquetas |
| limit | number | Número máximo de sugerencias (por defecto 10) |

**Respuesta:**

```json
[
  { "id": 1, "name": "dragon", "count": 25 },
  { "id": 2, "name": "dragón oriental", "count": 18 }
]
```

#### `GET /stencil-search/tags/popular`

Devuelve las etiquetas más populares utilizadas en estenciles.

**Parámetros de consulta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| limit | number | Número máximo de etiquetas a devolver (por defecto 10) |

## API de gestión de estenciles

Para los artistas, la API proporciona endpoints para gestionar sus estenciles.

### Endpoints principales

#### `GET /stencils/artist/:artistId`

Obtiene los estenciles de un artista específico, con soporte para paginación.

**Parámetros de consulta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | number | Número de página (por defecto 1) |
| limit | number | Resultados por página (por defecto 10) |
| available | boolean | Filtrar por disponibilidad |

#### `GET /stencils/:id`

Obtiene un estencil específico por su ID.

#### `POST /stencils`

Crea un nuevo estencil.

**Cuerpo de la solicitud:** `multipart/form-data`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| title | string | Título del estencil |
| description | string | Descripción del estencil |
| price | number | Precio del estencil |
| isAvailable | boolean | Indica si está disponible |
| tagIds | number[] | IDs de etiquetas asociadas |
| file | file | Imagen del estencil |

#### `PUT /stencils/:id`

Actualiza un estencil existente.

**Cuerpo de la solicitud:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "price": 60.0,
  "isAvailable": true,
  "tagIds": [1, 2, 3]
}
```

#### `DELETE /stencils/:id`

Elimina un estencil (borrado lógico).

## Sistema de relevancia

El sistema de búsqueda utiliza un algoritmo de relevancia sofisticado que considera múltiples factores para rankear los resultados:

### Factores considerados

1. **Coincidencia de texto (0.6)**: Utilizando búsqueda de texto completo con PostgreSQL
   - Coincidencia en título (peso A - más importante)
   - Coincidencia en descripción (peso B - importante)
   - Coincidencia en etiquetas (peso C - menos importante)

2. **Coincidencia exacta en título (0.3-0.4)**: Boost para coincidencias exactas en el título

3. **Reciente (0.15-0.05)**:
   - Estenciles creados en los últimos 30 días: +0.15
   - Estenciles creados en los últimos 90 días: +0.05

4. **Disponibilidad (0.1)**: Pequeño boost para estenciles disponibles

5. **Popularidad (hasta 0.2)**: Basado en el número de visualizaciones del estencil

### Explicación de relevancia

Cada resultado de búsqueda incluye:
- `relevanceScore`: Puntuación normalizada entre 0-1
- `relevanceFactors`: Array de factores que contribuyeron a la puntuación

## Manejo de etiquetas (tags)

Las etiquetas son una parte fundamental del sistema de estenciles:

1. **Asociación**: Los estenciles pueden tener múltiples etiquetas
2. **Búsqueda**: Se pueden filtrar estenciles por etiquetas
3. **Sugerencias**: Sistema de autocompletado de etiquetas durante la búsqueda
4. **Etiquetas populares**: API para obtener las etiquetas más utilizadas

### Mejores prácticas para etiquetas

- Utilizar etiquetas específicas pero comunes para mejorar la descubribilidad
- Incluir etiquetas tanto en inglés como en español cuando sea posible
- Las etiquetas son sensibles para el posicionamiento en búsquedas

## Guía de implementación para el frontend

### Flujo de búsqueda recomendado

1. **Página principal de búsqueda**:
   - Campo de búsqueda de texto con autocompletado
   - Sección de etiquetas populares/sugeridas
   - Filtros rápidos (disponibilidad, reciente)
   - Resultados iniciales ordenados por relevancia/popularidad

2. **Interacción de búsqueda**:
   - Consulta en tiempo real para sugerencias de etiquetas
   - Permitir selección múltiple de etiquetas
   - Mostrar indicadores visuales para los factores de relevancia
   - Opción para cambiar el criterio de ordenación

3. **Visualización de resultados**:
   - Mosaico de tarjetas con imagen principal, título y etiquetas
   - Indicador visual de disponibilidad
   - Paginación o scroll infinito

### Gestión de estenciles para artistas

1. **Panel de administración**:
   - Lista de estenciles con filtros y ordenación
   - Indicadores de popularidad y visualizaciones

2. **Formulario de creación/edición**:
   - Uploader de imágenes con vista previa
   - Gestor de etiquetas con sugerencias
   - Campos para título, descripción, precio y disponibilidad

3. **Analíticas básicas**:
   - Popularidad de estenciles
   - Tendencias de búsqueda

## Consideraciones de rendimiento

1. **Imágenes**:
   - La API genera automáticamente versiones en distintos tamaños (original, thumbnail)
   - Utilizar la URL de thumbnail para vistas en lista/mosaico

2. **Paginación**:
   - Implementar paginación en todas las vistas de lista
   - Respetar el valor máximo de `limit` (50) para evitar sobrecarga

3. **Búsqueda**:
   - Implementar debounce en consultas de texto (300-500ms)
   - Cachear resultados de búsquedas frecuentes en el frontend

4. **Carga progresiva**:
   - Implementar lazy loading de imágenes
   - Considerar fetching incremental para búsquedas complejas

---

## Ejemplos de integración

### Ejemplo de búsqueda con React y TypeScript

```typescript
interface SearchParams {
  query?: string;
  tagIds?: number[];
  artistId?: number;
  onlyAvailable?: boolean;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popularity';
  page: number;
  limit: number;
}

const fetchStencils = async (params: SearchParams) => {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('query', params.query);
  if (params.tagIds?.length) params.tagIds.forEach(id => queryParams.append('tagIds', id.toString()));
  if (params.artistId) queryParams.append('artistId', params.artistId.toString());
  if (params.onlyAvailable !== undefined) queryParams.append('onlyAvailable', params.onlyAvailable.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  
  queryParams.append('page', params.page.toString());
  queryParams.append('limit', params.limit.toString());
  
  const response = await fetch(`/api/stencil-search?${queryParams.toString()}`);
  return response.json();
};
``` 