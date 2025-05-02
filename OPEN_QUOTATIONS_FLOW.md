# Flujo de Cotizaciones Abiertas (Vista del Cliente)

Este documento describe cómo un cliente interactúa con el sistema de cotizaciones abiertas ("Open Quotations") para solicitar tatuajes sin especificar un artista directo.

## 1. Creación de una Cotización Abierta

Un cliente puede crear una cotización abierta para recibir propuestas de diferentes artistas cercanos.

- **Endpoint:** `POST /quotations`
- **Método:** `POST`
- **Autenticación:** Requerida (Token JWT de Cliente)
- **Tipo de Contenido:** `multipart/form-data`

**Parámetros del Body (form-data):**

- `type` (Opcional): Debe ser `OPEN`. Si se omite, por defecto es `DIRECT`.
- `description` (Requerido): Descripción detallada del tatuaje deseado.
- `stencilId` (Opcional): ID de un stencil específico (no compatible con `tattooDesignCacheId`).
- `tattooDesignCacheId` (Opcional, solo para `OPEN`): ID de un diseño AI generado previamente. Requerido si se proporciona `tattooDesignImageUrl`.
- `tattooDesignImageUrl` (Opcional, solo para `OPEN`): URL específica de una imagen del `tattooDesignCacheId`.
- `files[]` (Opcional): Imágenes de referencia (archivos binarios).
- `customerLat` (Requerido para `OPEN`): Latitud de la ubicación del cliente o donde desea el tatuaje.
- `customerLon` (Requerido para `OPEN`): Longitud de la ubicación del cliente.
- `customerTravelRadiusKm` (Requerido para `OPEN`): Distancia máxima (en KM) que el cliente está dispuesto a viajar para encontrarse con un artista (e.g., 50).

**Respuesta Exitosa (201 Created):**

```json
{
  "status": "created",
  "data": "Quotation <quotation_id> created."
}
```

Una vez creada, la cotización entra en estado `OPEN` y se vuelve visible para los artistas que cumplan con los criterios de ubicación.

## 2. Listar Cotizaciones Abiertas del Cliente (y sus Ofertas)

El cliente puede ver todas sus cotizaciones, incluyendo las abiertas y las ofertas que han recibido.

- **Endpoint:** `GET /quotations`
- **Método:** `GET`
- **Autenticación:** Requerida (Token JWT de Cliente)

**Query Parameters:**

- `type` (Opcional): Filtrar por tipo. Usar `OPEN` para ver solo las cotizaciones abiertas.
- `status` (Opcional): Filtrar por estado (e.g., `OPEN`, `PENDING_ACCEPTANCE`).
- `page` (Opcional): Número de página (default: 1).
- `limit` (Opcional): Número de resultados por página (default: 10).

**Ejemplo de Request:** `GET /quotations?type=OPEN&status=OPEN`

**Respuesta Exitosa (200 OK):**

```json
{
  "items": [
    {
      "id": "clxyz789...",
      "customerId": "cust_abc...",
      "artistId": null,
      "type": "OPEN",
      "status": "OPEN",
      "description": "Quiero un fénix en acuarela en la espalda.",
      "referenceImages": ["url1.jpg", "url2.png"],
      // ... otros campos de la cotización ...
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "offers": [ // Array de ofertas recibidas
        {
          "id": "offer_123...",
          "artistId": "artist_xyz...",
          "artistName": "Artista Ejemplo Uno",
          "estimatedCost": 350,
          "message": "Hola, me encantaría hacer este fénix. Adjunto bocetos."
        },
        {
          "id": "offer_456...",
          "artistId": "artist_pqr...",
          "artistName": "Otro Artista",
          "estimatedCost": 400,
          "message": "Tengo experiencia en acuarela, creo que podemos lograr algo genial."
        }
      ]
    }
    // ... más cotizaciones abiertas del cliente
  ],
  "total": 1 // Número total de cotizaciones que coinciden con el filtro
}
```

El campo `offers` contiene una lista de las propuestas enviadas por los artistas para esa cotización abierta específica.

## 3. Ver Detalles de una Cotización Específica (Incluyendo Ofertas)

Similar a listar, al obtener una cotización individual que sea de tipo `OPEN`, también se devolverán las ofertas.

- **Endpoint:** `GET /quotations/{id}`
- **Método:** `GET`
- **Autenticación:** Requerida (Token JWT de Cliente o Artista asociado)

**Respuesta Exitosa (200 OK):**

La estructura es similar a un item de la respuesta de `GET /quotations`, incluyendo el campo `offers` si la cotización es de tipo `OPEN`.

## 4. Listar Ofertas para una Cotización Abierta Específica

Existe un endpoint dedicado para obtener solo las ofertas de una cotización abierta.

- **Endpoint:** `GET /quotations/{id}/offers`
- **Método:** `GET`
- **Autenticación:** Requerida (Token JWT del Cliente creador de la cotización)

**Respuesta Exitosa (200 OK):**

```json
{
  "offers": [
    {
      "id": "offer_123...",
      "artistId": "artist_xyz...",
      "artistName": "Artista Ejemplo Uno",
      "estimatedCost": 350,
      "message": "Hola, me encantaría hacer este fénix. Adjunto bocetos."
    },
    {
      "id": "offer_456...",
      "artistId": "artist_pqr...",
      "artistName": "Otro Artista",
      "estimatedCost": 400,
      "message": "Tengo experiencia en acuarela, creo que podemos lograr algo genial."
    }
  ]
}
```

## 5. Aceptar una Oferta

Una vez que el cliente ha revisado las ofertas, puede aceptar una, lo que cambiará el estado de la cotización y la asociará con el artista elegido.

- **Endpoint:** `POST /quotations/{id}/offers/{offerId}/accept`
- **Método:** `POST`
- **Autenticación:** Requerida (Token JWT del Cliente creador de la cotización)
- **Parámetros URL:**
    - `id`: ID de la Cotización.
    - `offerId`: ID de la Oferta a aceptar.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "ok",
  "data": "Offer accepted. Quotation status updated to PENDING_DEPOSIT."
}
```

Al aceptar una oferta:
- La cotización (`Quotation`) se actualiza:
    - `status` cambia (e.g., a `PENDING_DEPOSIT` o similar).
    - Se asigna el `artistId` del artista cuya oferta fue aceptada.
- Se notifica al artista elegido.
- Las demás ofertas para esta cotización pueden ser marcadas como rechazadas o simplemente ignoradas.
- La cotización sigue el flujo normal de una cotización directa (depósito, agendamiento, etc.).

Este flujo permite a los clientes explorar opciones con varios artistas basándose en la ubicación y las propuestas específicas para su idea. 