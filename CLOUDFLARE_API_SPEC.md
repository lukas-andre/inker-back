# Guía Detallada de la API de Cloudflare Images

## Autenticación y Configuración Inicial

Para comenzar a utilizar la API de Cloudflare Images, necesitarás los siguientes elementos fundamentales[1]:

- **Account ID**: Identificador de tu cuenta de Cloudflare (se encuentra en el dashboard)
- **API Token**: Token de autenticación Bearer para las solicitudes a la API
- **URL Base**: `https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1`

La autenticación se realiza mediante el encabezado de autorización Bearer en todas las solicitudes[2]:

```
Authorization: Bearer Sn3lZJTBX6kkg7OdcBUAxOO963GEIyGQqnFTOFYY
```

## Endpoints Principales

### 1. Subir Imágenes

Para subir una imagen directamente a Cloudflare Images, utiliza una solicitud POST con formato multipart/form-data[1][3]:

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1
```

Parámetros importantes:
- `file`: El archivo de imagen binario (hasta 10 MB)
- `metadata`: Objeto JSON opcional para almacenar metadatos personalizados
- `requireSignedURLs`: Booleano que indica si la imagen requiere URLs firmadas para acceso

Ejemplo de código para subir una imagen[3]:

```javascript
const formData = new FormData();
formData.append("file", blob, "nombre_archivo");

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
  },
  body: formData,
});
```

### 2. Subida Directa por Usuarios

Para permitir que los usuarios suban imágenes sin exponer tus credenciales, utiliza el endpoint de subida directa[4]:

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v2/direct_upload
```

Este endpoint devuelve una URL de subida temporal y un ID de imagen[4][5]. La URL expira después de 30 minutos por defecto, pero puedes configurar este tiempo con el parámetro `expiry`[4].

### 3. Listar Imágenes

Para obtener una lista de imágenes almacenadas[6]:

```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1
```

Parámetros opcionales:
- `page`: Número de página para resultados paginados
- `per_page`: Cantidad de elementos por página (máximo 100)

Para listas más grandes (hasta 10,000 imágenes), utiliza la versión v2 del endpoint[7]:

```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v2
```

### 4. Obtener Detalles de una Imagen

Para obtener información detallada sobre una imagen específica[1]:

```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/{identifier}
```

### 5. Actualizar Imagen

Para actualizar los metadatos o la configuración de acceso de una imagen[8]:

```
PATCH https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/{identifier}
```

### 6. Eliminar Imagen

Para eliminar permanentemente una imagen[1]:

```
DELETE https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/{identifier}
```

## Gestión de Variantes

Las variantes permiten crear diferentes versiones redimensionadas de la misma imagen original[9].

### Crear Variante

```
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/variants
```

Ejemplo de cuerpo de solicitud para crear una variante[9]:

```json
{
  "id": "thumbnail",
  "options": {
    "width": 200,
    "height": 200,
    "fit": "cover",
    "metadata": "none"
  }
}
```

Opciones de ajuste (`fit`) disponibles[9]:
- `scale-down`: Reduce la imagen sin ampliarla
- `contain`: Redimensiona manteniendo la relación de aspecto
- `cover`: Redimensiona y recorta para llenar el área especificada
- `crop`: Reduce y recorta para ajustarse al área especificada
- `pad`: Redimensiona y rellena con color de fondo

### Listar Variantes

```
GET https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/variants
```

### Variantes Flexibles

Las variantes flexibles permiten transformaciones dinámicas en la URL de entrega[10]:

```
https://imagedelivery.net/{account_hash}/{image_id}/w=400,sharpen=3
```

Para activar esta función, utiliza:

```
PATCH https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/variants/{variant_id}
```

## URLs de Entrega de Imágenes

### Formato Estándar

Las imágenes se entregan a través de URLs con este formato[11]:

```
https://imagedelivery.net/{account_hash}/{image_id}/{variant_name}
```

### Dominio Personalizado

También puedes servir imágenes desde dominios personalizados[11]:

```
https://example.com/cdn-cgi/imagedelivery/{account_hash}/{image_id}/{variant_name}
```

### URLs Firmadas para Imágenes Privadas

Para imágenes privadas, necesitas generar URLs firmadas con tokens[12]:

1. Obtén tu clave de firma desde el dashboard o mediante la API
2. Genera un token con fecha de expiración
3. Añade el token a la URL de la imagen

## Manejo de Errores y Limitaciones

### Códigos de Error Comunes

- **415**: Tipo de medio no soportado (verifica el formato de imagen)[13]
- **413**: Carga útil demasiado grande (límite de 10 MB por imagen)[14]
- **5455**: Formato de imagen no soportado (solo JPEG, PNG, WebP, GIF, SVG)[15]
- **5559**: Error temporal de la API (reintenta más tarde)[16]

### Límites de Tasa

- **API Global**: 1,200 solicitudes por cada cinco minutos[17][18]
- Para clientes empresariales, este límite puede aumentarse previa solicitud[17]

### Limitaciones Técnicas

- Tamaño máximo por imagen: 10 MB
- Formatos soportados: JPEG, PNG, WebP, GIF (incluidas animaciones), SVG
- Dimensiones máximas: 12,000 píxeles por lado
- Área máxima: 100 megapíxeles
- Metadatos limitados a 1024 bytes

## Integración con Flutter

Aunque no hay ejemplos directos de integración con Flutter para Cloudflare Images, puedes utilizar el paquete oficial de Dart para Cloudflare[19]:

```dart
// Ejemplo conceptual de uso del paquete cloudflare
final cloudflare = Cloudflare(
  accountId: accountId,
  token: token,
);

// Subir imagen
final response = await cloudflare.images.v1.create(
  account_id: accountId,
  file: imageFile,
);
```

Este paquete proporciona soporte completo para la API de Cloudflare Images y utiliza retrofit para solicitudes REST[19].

## Consideraciones Importantes

- Las imágenes subidas mediante formularios deben usar el formato multipart/form-data[20]
- Para evitar problemas CORS, configura adecuadamente los encabezados en tus solicitudes
- Las imágenes con parámetros en la URL (como `imagen.png?w=300`) pueden causar problemas al subirlas por URL[13]
- Considera los límites de tasa al planificar cargas masivas de imágenes[18]

Esta guía cubre los aspectos fundamentales para comenzar a trabajar con la API de Cloudflare Images desde cero, permitiéndote implementar todas las funcionalidades necesarias para tu proyecto en fase beta[21][22].
