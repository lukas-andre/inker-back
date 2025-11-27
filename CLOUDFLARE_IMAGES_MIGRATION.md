# Migración de AWS S3 a Cloudflare Images

## Resumen de la Implementación Actual

### Arquitectura Actual con AWS S3
- **Cliente S3**: `S3Client` en `/src/global/infrastructure/clients/s3.client.ts`
- **Servicio de Multimedia**: `MultimediasService` en `/src/multimedias/services/multimedias.service.ts`
- **Configuración**: `AWSConfig` en `/src/config/aws.config.ts`
- **CDN**: CloudFront como CDN para servir las imágenes

### Flujo Actual
1. Los archivos se suben a S3 mediante el método `put()` del `S3Client`
2. Se generan URLs de CloudFront para acceder a las imágenes
3. Las imágenes se organizan en carpetas según su propósito:
   - `artist/posts/{artistId}/{postId}_{index}`
   - `agenda/{agendaId}/event/{eventId}/work-evidence/file_{index}`
   - `quotation/{quotationId}/artist/{artistId}/reference-images/reference_{index}`
   - `quotation/{quotationId}/artist/{artistId}/proposed-images/proposed_{index}`
   - `quotation/{quotationId}/artist/{artistId}/proposed-designs/design_{index}`

## Pasos para la Migración a Cloudflare Images

### 1. Configuración de Cloudflare Images

#### 1.1 Crear cuenta y obtener credenciales
- Acceder a Cloudflare Dashboard
- Activar Cloudflare Images en tu cuenta
- Obtener:
  - Account ID
  - API Token con permisos para Cloudflare Images

#### 1.2 Variables de entorno necesarias
```env
# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account_hash
```

### 2. Crear Nueva Configuración

#### 2.1 Crear archivo de configuración para Cloudflare
```typescript
// src/config/cloudflare.config.ts
import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type CloudflareConfig = {
  accountId: string;
  apiToken: string;
  imagesDeliveryUrl: string;
};

export const CloudflareConfig = registerAs<CloudflareConfig>('cloudflare', () => ({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  imagesDeliveryUrl: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL,
}));

export const CloudflareConfigSchema = Joi.object({
  CLOUDFLARE_ACCOUNT_ID: Joi.string().required(),
  CLOUDFLARE_API_TOKEN: Joi.string().required(),
  CLOUDFLARE_IMAGES_DELIVERY_URL: Joi.string().required(),
});
```

### 3. Crear Cliente de Cloudflare Images

#### 3.1 Implementar CloudflareImagesClient
```typescript
// src/global/infrastructure/clients/cloudflare-images.client.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class CloudflareImagesClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get('cloudflare.accountId');
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    this.headers = {
      'Authorization': `Bearer ${this.configService.get('cloudflare.apiToken')}`,
    };
  }

  async upload(
    buffer: Buffer,
    filename: string,
    metadata?: Record<string, string>
  ): Promise<{ id: string; variants: string[] }> {
    const formData = new FormData();
    formData.append('file', buffer, filename);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await axios.post(this.baseUrl, formData, {
      headers: {
        ...this.headers,
        ...formData.getHeaders(),
      },
    });

    return response.data.result;
  }

  async delete(imageId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${imageId}`, {
      headers: this.headers,
    });
  }

  getImageUrl(imageId: string, variant: string = 'public'): string {
    const deliveryUrl = this.configService.get('cloudflare.imagesDeliveryUrl');
    return `${deliveryUrl}/${imageId}/${variant}`;
  }
}
```

### 4. Adaptar el Servicio de Multimedia

#### 4.1 Estrategia de migración gradual
Se recomienda implementar un patrón de estrategia para poder cambiar entre S3 y Cloudflare:

```typescript
// src/multimedias/interfaces/storage-strategy.interface.ts
export interface StorageStrategy {
  upload(file: FileInterface, path: string): Promise<{ url: string; id: string }>;
  delete(identifier: string): Promise<void>;
}
```

#### 4.2 Implementar estrategias
```typescript
// src/multimedias/strategies/s3-storage.strategy.ts
// Implementación actual de S3

// src/multimedias/strategies/cloudflare-storage.strategy.ts
// Nueva implementación con Cloudflare Images
```

### 5. Consideraciones de Migración

#### 5.1 Diferencias clave entre S3 y Cloudflare Images

| Característica | AWS S3 | Cloudflare Images |
|----------------|---------|-------------------|
| Estructura de carpetas | Sí | No (usa metadatos) |
| Límite de tamaño | Configurable | 10MB por imagen |
| Formatos soportados | Todos | JPEG, PNG, GIF, WebP |
| Transformaciones | No nativo | Sí (variantes automáticas) |
| Precio | Por almacenamiento + transferencia | Por imagen almacenada |

#### 5.2 Mapeo de rutas a metadatos
Como Cloudflare Images no soporta estructura de carpetas, usar metadatos:

```typescript
// Ejemplo de metadatos para reemplazar rutas
const metadata = {
  type: 'post', // o 'work-evidence', 'reference-image', etc.
  artistId: 'artist123',
  postId: 'post456',
  index: '0'
};
```

### 6. Plan de Migración de Datos

#### 6.1 Migración de imágenes existentes
1. Script para listar todas las imágenes en S3
2. Descargar cada imagen
3. Subirla a Cloudflare Images con metadatos apropiados
4. Actualizar URLs en la base de datos
5. Verificar integridad
6. Eliminar de S3 (después de periodo de prueba)

#### 6.2 Script de migración básico
```typescript
// scripts/migrate-to-cloudflare.ts
async function migrateImages() {
  // 1. Listar objetos de S3
  // 2. Para cada objeto:
  //    - Descargar de S3
  //    - Extraer metadatos de la ruta
  //    - Subir a Cloudflare con metadatos
  //    - Actualizar base de datos
  // 3. Generar reporte de migración
}
```

### 7. Actualización de la Base de Datos

#### 7.1 Cambios necesarios
- Actualizar campo `url` para usar URLs de Cloudflare
- Considerar agregar campo `cloudflareImageId` para referencia
- Mantener temporalmente ambas URLs durante la transición

### 8. Configuración de Variantes en Cloudflare

#### 8.1 Variantes recomendadas
```json
{
  "thumbnail": { "width": 150, "height": 150, "fit": "cover" },
  "small": { "width": 400, "height": 400, "fit": "contain" },
  "medium": { "width": 800, "height": 800, "fit": "contain" },
  "large": { "width": 1600, "height": 1600, "fit": "contain" },
  "public": { "width": 2000, "height": 2000, "fit": "contain" }
}
```

### 9. Testing y Validación

#### 9.1 Tests a implementar
- [ ] Upload de imagen individual
- [ ] Upload múltiple (batch)
- [ ] Eliminación de imágenes
- [ ] Generación correcta de URLs
- [ ] Manejo de errores
- [ ] Límites de tamaño
- [ ] Formatos no soportados

#### 9.2 Monitoreo
- Configurar alertas para fallos de upload
- Monitorear uso de cuota de Cloudflare Images
- Comparar costos S3 vs Cloudflare

### 10. Rollback Plan

#### 10.1 Estrategia de rollback
1. Mantener código de S3 con feature flag
2. Periodo de prueba de 30 días
3. Backup completo antes de eliminar imágenes de S3
4. Documentar proceso de reversión

### 11. Beneficios de la Migración

1. **Optimización automática**: Cloudflare optimiza imágenes automáticamente
2. **Variantes bajo demanda**: No necesitas pre-generar diferentes tamaños
3. **CDN global incluido**: Sin costos adicionales de CDN
4. **Mejor rendimiento**: Entrega optimizada según dispositivo
5. **Menor complejidad**: No gestionar buckets ni políticas

### 12. Limitaciones a Considerar

1. **Tamaño máximo**: 10MB por imagen
2. **Formatos limitados**: Solo imágenes (no videos ni PDFs)
3. **Sin estructura de carpetas**: Usar metadatos para organización
4. **Cuota de almacenamiento**: Según plan contratado

## Próximos Pasos

1. [ ] Revisar y aprobar el plan de migración
2. [ ] Configurar cuenta de Cloudflare Images
3. [ ] Implementar CloudflareImagesClient
4. [ ] Crear estrategia de almacenamiento
5. [ ] Implementar feature flag para cambio gradual
6. [ ] Desarrollar script de migración
7. [ ] Ejecutar migración en ambiente de prueba
8. [ ] Validar funcionamiento
9. [ ] Migrar producción
10. [ ] Monitorear y optimizar

## Recursos Adicionales

- [Documentación de Cloudflare Images](https://developers.cloudflare.com/images/)
- [API Reference](https://api.cloudflare.com/#cloudflare-images)
- [Pricing Calculator](https://www.cloudflare.com/products/cloudflare-images/)