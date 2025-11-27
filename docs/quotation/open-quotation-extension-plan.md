# Plan de Extensión: Cotizaciones Abiertas

## 1. Objetivo

Extender el módulo de cotizaciones existente para permitir a los usuarios crear "Cotizaciones Abiertas". Estas cotizaciones no están dirigidas a un artista específico, sino que quedan disponibles para que cualquier artista interesado pueda revisarlas y enviar una oferta. El usuario luego elige la oferta que prefiera. Se añadirá información de ubicación del cliente y su radio de desplazamiento para facilitar el match con artistas cercanos.

## 2. Sistema Actual (Resumen)

*   **Flujo:** Usuario selecciona Artista -> Usuario envía Solicitud de Cotización -> Artista Responde (cotiza/rechaza) -> Usuario Responde (acepta/rechaza/apela).
*   **Entidades Principales:** `Quotation` (siempre con `artistId`), `QuotationHistory`.
*   **Estados:** `pending`, `quoted`, `accepted`, `rejected`, `appealed`, `canceled`.
*   **Tecnología:** NestJS, TypeORM, Bull (Notificaciones), Fastify.

## 3. Propuesta de Extensión

Se propone extender el sistema actual introduciendo un nuevo tipo de cotización y una entidad para manejar las ofertas.

### 3.1. Cambios en Base de Datos

*   **Entidad `Quotation` (`quotation.entity.ts`):**
    *   Añadir campo `type: 'DIRECT' | 'OPEN'` (default: `'DIRECT'`).
    *   Modificar `artistId`: hacerlo `nullable`. Será `null` si `type` es `'OPEN'`.
    *   **Nuevos campos para `type='OPEN'`: **
        *   `customerLat` (float, nullable): Latitud del cliente para esta cotización.
        *   `customerLon` (float, nullable): Longitud del cliente para esta cotización.
        *   `customerTravelRadiusKm` (integer, nullable): Distancia máxima en KM que el cliente está dispuesto a viajar.
    *   Añadir nuevos estados a `QuotationStatus` (o reutilizar/combinar existentes):
        *   `OPEN`: Esperando ofertas de artistas.
        *   `AWAITING_SELECTION`: (Opcional) Hay ofertas, esperando decisión del usuario.
        *   `CLOSED`: (Opcional) Cotización abierta finalizada (por selección o cancelación).
*   **Nueva Entidad `QuotationOffer`:**
    *   Tabla: `quotation_offers`
    *   Campos: `id`, `quotationId` (FK a `Quotation`), `artistId` (FK a `Artist`), `estimatedCost` (MoneyEmbed), `estimatedDuration` (number), `message` (string, nullable), `status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'`, `createdAt`, `updatedAt`.

### 3.2. Nuevos Endpoints API y Cambios en DTOs

*   **Usuario:**
    *   `POST /quotations`: Modificar `CreateQuotationReqDto` para aceptar `type`, `artistId` opcional, y requerir `customerLat`, `customerLon`, `customerTravelRadiusKm` si `type` es `'OPEN'`.
    *   `GET /quotations/{id}/offers`: Listar ofertas para una cotización abierta. **La respuesta incluirá la distancia estimada del artista oferente a la ubicación del cliente.**
    *   `POST /quotations/{id}/offers/{offerId}/accept`: Aceptar una oferta específica.
*   **Artista:**
    *   `GET /quotations/open`: Listar cotizaciones abiertas disponibles. **La respuesta incluirá la distancia estimada desde la ubicación principal del artista a la ubicación del cliente.** Se pueden añadir filtros de distancia (e.g., `?maxDistance=50`).
    *   `POST /quotations/{id}/offers`: Enviar una oferta a una cotización abierta.
    *   `DELETE /quotations/offers/{offerId}`: (Opcional) Retirar una oferta.
*   **DTOs:** Actualizar `GetQuotationResDto` y DTOs de respuesta de listados para incluir los nuevos campos de ubicación y las distancias calculadas donde sea relevante.

### 3.3. Nuevo Flujo (Open Quotation)

1.  **Creación (User):** `POST /quotations` (`type='OPEN'`, `artistId=null`, `customerLat`, `customerLon`, `customerTravelRadiusKm`) -> `Quotation` en estado `OPEN`.
2.  **Descubrimiento (Artist):** `GET /quotations/open` (puede filtrar por distancia). Muestra cotizaciones con distancia calculada.
3.  **Oferta (Artist):** `POST /quotations/{id}/offers` -> Crea `QuotationOffer` (`status='SUBMITTED'`). -> Notifica User.
4.  **Revisión (User):** `GET /quotations/{id}/offers`. Muestra ofertas con distancia del artista calculada.
5.  **Aceptación (User):** `POST /quotations/{id}/offers/{offerId}/accept`.
    *   Actualiza `QuotationOffer` (aceptada -> `ACCEPTED`, otras -> `REJECTED`).
    *   Actualiza `Quotation` original: asigna `artistId`, copia datos de oferta, cambia `status` (e.g., a `QUOTED` o `ACCEPTED` para reenganchar con flujo existente).
    *   Notifica Artistas (ganador y rechazados).
6.  **Continuación:** La `Quotation` sigue el flujo `DIRECT` desde el nuevo estado.

### 3.4. Lógica de Negocio (Use Cases / Services)

*   Modificar `CreateQuotationUseCase` para validar y guardar los datos de ubicación si `type='OPEN'`.
*   Crear nuevos Use Cases:
    *   `ListOpenQuotationsUseCase`: **Implementar lógica de filtrado por distancia (usando `customerTravelRadiusKm` y la ubicación del artista) y cálculo de distancia para la respuesta.**
    *   `SubmitQuotationOfferUseCase`
    *   `ListQuotationOffersUseCase`: **Implementar cálculo de distancia desde el artista oferente a la ubicación del cliente.**
    *   `AcceptQuotationOfferUseCase`
    *   `WithdrawQuotationOfferUseCase` (opcional)
*   Ajustar `QuotationStateMachine` y Use Cases existentes para manejar los nuevos estados/tipos y la transición post-aceptación.
*   **Dependencia:** Se necesitará acceso a la ubicación principal del artista (probablemente desde `Artist` o `ArtistLocation`) para los cálculos de distancia.

### 3.5. Notificaciones

*   Usuario: Nueva oferta recibida.
*   Artista: Oferta aceptada.
*   Artista: Oferta rechazada.

## 4. Pasos de Implementación (Alto Nivel)

1.  **Migración DB:** Añadir campos `type`, `customerLat`, `customerLon`, `customerTravelRadiusKm` y hacer `artistId` nullable en `quotations`. Crear tabla `quotation_offers`.
2.  **Entidades/DTOs:** Actualizar `Quotation`, crear `QuotationOffer`, actualizar DTOs (`CreateQuotationReqDto`, DTOs de respuesta) para incluir campos de ubicación y distancia.
3.  **Repositorios:** Crear `QuotationOfferRepository`, actualizar `QuotationRepository` si es necesario.
4.  **Use Cases:** Implementar la lógica de negocio nueva y modificada, **incluyendo cálculos/filtros de distancia.**
5.  **StateMachine:** Ajustar las transiciones de estado.
6.  **Controladores:** Exponer los nuevos endpoints y actualizar respuestas en `QuotationController`.
7.  **Notificaciones:** Implementar los triggers para Bull/Firebase.
8.  **Pruebas:** Añadir tests unitarios, de integración y e2e para los nuevos flujos y lógica de ubicación.

## 5. Consideraciones Adicionales

*   **Cálculo de Distancia:** Utilizar una librería adecuada (como `geolib` o similar) o funciones de base de datos geoespaciales (si aplica) para calcular distancias entre coordenadas (considerando la curvatura terrestre para mayor precisión - Haversine formula).
*   **Ubicación del Artista:** Asegurarse de que la ubicación principal del artista esté disponible y sea fiable para los cálculos.
*   **Separación de BDs:** Confirmar si `Quotation`, `Artist`, `Customer` residen en la misma BD (`AGENDA_DB_CONNECTION_NAME` parece indicarlo para `Quotation`). Si no, se requerirán estrategias para manejar transacciones o consistencia eventual al acceder a datos de artistas/clientes.
*   **Filtros para Artistas:** Además de la distancia, se pueden añadir otros filtros en `GET /quotations/open` (especialidad, etc.).
*   **UI/UX:** La interfaz de usuario deberá permitir ingresar la ubicación/radio y mostrar las distancias calculadas de forma clara.
*   **Casos Borde:** Manejar cancelación de cotización abierta, retiro de ofertas, timeouts, cotizaciones sin ubicación (si se permiten). 