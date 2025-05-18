# Especificación Técnica: Formularios de Consentimiento Digital

## Arquitectura Backend (NestJS)

### 1. Estructura de Módulo
```
consent-module/
├── domain
│   ├── entities
│   │   └── consent-template.entity.ts  # Entidad de plantilla
│   ├── dtos
│   │   ├── create-template.dto.ts
│   │   └── sign-consent.dto.ts
│   └── enums
│       └── consent-type.enum.ts  # Tipos de consentimiento
├── infrastructure
│   ├── controllers
│   │   └── consent.controller.ts
│   ├── repositories
│   │   ├── consent-template.repository.ts
│   │   └── signed-consent.repository.ts
│   └── services
│       └── pdf-generator.service.ts  # Servicio para generación de PDF
└── usecases
    ├── create-template.usecase.ts
    ├── get-template.usecase.ts
    └── sign-consent.usecase.ts
```

### 2. Entidades Clave
```typescript
// FormTemplateEntity
@Entity()
export class FormTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('jsonb')  // Almacena estructura del formulario en JSON
  schema: FormSchema;

  @Column({ type: 'enum', enum: ConsentType })
  consentType: ConsentType;

  @ManyToOne(() => Artist)
  artist: Artist;
}

// SignedConsentEntity
@Entity()
export class SignedConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgendaEvent)
  event: AgendaEvent;

  @Column('jsonb')
  signedData: Record;

  @Column()
  digitalSignature: string;

  @CreateDateColumn()
  signedAt: Date;
}
```

### 3. Flujo de Firmas
1. **Creación de Plantilla**
   - Endpoint: `POST /studio/consent-templates`
   - Valida permisos de artista
   - Almacena schema JSON en PostgreSQL con TypeORM

2. **Asignación a Evento**
   - Modificar `AgendaEventEntity`:
   ```typescript
   @OneToMany(() => SignedConsentEntity, consent => consent.event)
   consents: SignedConsentEntity[];
   ```

3. **Firma Digital**
   - Endpoint: `POST /events/:id/consents/sign`
   - Verifica estado `confirmed`
   - Valida campos requeridos
   - Genera PDF con Puppeteer y almacena en S3
   - Registra firma en base de datos

### 4. Validación de Estado
Modificar `EventActionEngineService`:
```typescript
// En canTransitionToInProgress()
if (event.status === AgendaEventStatus.CONFIRMED) {
  const requiredConsents = await this.consentService.getRequiredConsents(event.id);
  if (requiredConsents.some(consent => !consent.signedAt)) {
    reasons.blockTransition = "Faltan consentimientos firmados";
    return false;
  }
}
```

```
### 3. Almacenamiento Seguro
```typescript
// services/aws.js
export const uploadConsentPDF = async (pdfBuffer) => {
  const s3 = new AWS.S3();
  const key = `consents/${Date.now()}-${uuidv4()}.pdf`;
  
  const params = {
    Bucket: process.env.NEXT_PUBLIC_CONSENTS_BUCKET,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ACL: 'private',
    ServerSideEncryption: 'AES256'
  };

  return s3.upload(params).promise();
};
```

## API Design

### 1. Endpoints Principales
| Método | Endpoint                 | Descripción                             |
|--------|--------------------------|-----------------------------------------|
| POST   | /studio/consent-templates | Crea nueva plantilla de consentimiento  |
| GET    | /consent-templates       | Lista plantillas disponibles            |
| POST   | /events/:id/consents     | Firma consentimiento para evento        |
| GET    | /events/:id/consents     | Obtiene consentimientos firmados        |

### 2. Esquema JSON de Plantilla
```json
{
  "title": "Tatuaje en Zona Sensible",
  "fields": [
    {
      "type": "checkbox",
      "label": "Alergias conocidas",
      "required": true,
      "options": ["Pigmentos rojos", "Latex", "Anestésicos tópicos"]
    },
    {
      "type": "signature",
      "label": "Firma del cliente",
      "required": true
    }
  ],
  "logic": {
    "showIf": {
      "field": "edad",
      "condition": ">=18"
    }
  }
}
```

## Seguridad y Cumplimiento

1. **Cifrado de Datos**
   - AES-256 para almacenamiento en S3
   - TLS 1.3 para transmisión de datos

2. **Registro de Auditoría**
```typescript
// En servicio de firma
async function logConsentAction(action: ConsentAction) {
  await auditLogRepository.save({
    userId: action.userId,
    eventId: action.eventId,
    ipAddress: action.ip,
    userAgent: action.userAgent,
    timestamp: new Date()
  });
}
```

3. **Retención de Documentos**
   - Política de retención configurable (default: 7 años)
   - Eliminación segura con overwrite en S3

## Escalabilidad

1. **Estrategia de Caché**
```typescript
// En repositorio de plantillas
@Cache({ ttl: 3600 })
async getTemplatesByArtist(artistId: string) {
  return this.find({ where: { artistId } });
}
```

2. **Procesamiento Asíncrono**
```typescript
// En servicio de PDF
@Queue('pdf-generation')
async generateConsentPDFJob(payload: PdfJobPayload) {
  const pdf = await this.pdfGenerator.generate(payload);
  await this.storageService.upload(pdf);
}
```

Esta implementación se integra con la arquitectura existente manteniendo los principios de Clean Architecture y permitiendo escalar mediante:
1. Separación clara entre lógica de negocio y infraestructura
2. Uso de DTOs para validación consistente
3. Implementación modular de características
4. Diseño responsive para mobile-first en flujo de firma

Citations:
[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/48061903/e476151b-681f-402a-8009-9b87ae17e3e5/Arquitectura-del-proyecto.md

---
Respuesta de Perplexity: pplx.ai/share