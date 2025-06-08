# 🎨 Guía de Integración Frontend - Módulo de Consentimientos

## 🎯 Resumen del MVP

Para simplificar el MVP, todos los customers deben aceptar los mismos términos y condiciones por defecto antes de confirmar un evento. No hay templates personalizados por artista en esta versión inicial.

## 📋 Endpoints Disponibles

### 1. **Verificar Estado del Consent**
```
GET /consents/check-consent-status/:eventId
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta:**
```typescript
{
  eventId: string;
  hasSigned: boolean;
  signedAt?: string; // ISO date if signed
  templateTitle?: string; // "Términos y Condiciones por Defecto"
}
```

### 2. **Aceptar Términos por Defecto**
```
POST /consents/accept-default-terms
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```typescript
{
  eventId: string;
  digitalSignature: string; // Puede ser nombre completo o firma imagen base64
}
```

**Respuesta:**
```typescript
{
  id: string;
  eventId: string;
  signedData: Record<string, any>;
  digitalSignature: string;
  signedAt: string;
  userId: string;
}
```

### 3. **Obtener Acciones Disponibles**
```
GET /agenda/events/:eventId/actions
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta incluye:**
```typescript
{
  canAcceptConsent: boolean; // NUEVA ACCIÓN
  canConfirmEvent: boolean;
  canRejectEvent: boolean;
  // ... otras acciones
  reasons: {
    canAcceptConsent?: string;
    // ... otras razones
  }
}
```

## 🔄 Flujo de Integración Completo

### **Paso 1: Verificar Estado al Cargar Evento**

```typescript
async function checkConsentStatus(eventId: string): Promise<ConsentStatus> {
  const response = await fetch(`/consents/check-consent-status/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Error checking consent status');
  }
  
  return response.json();
}
```

### **Paso 2: Verificar Acciones Disponibles**

```typescript
async function getEventActions(eventId: string): Promise<EventActions> {
  const response = await fetch(`/agenda/events/${eventId}/actions`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
    },
  });
  
  return response.json();
}
```

### **Paso 3: Mostrar UI Condicionalmente**

```typescript
interface ConsentModalProps {
  eventId: string;
  onAccept: () => void;
  onCancel: () => void;
}

function ConsentModal({ eventId, onAccept, onCancel }: ConsentModalProps) {
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await fetch('/consents/accept-default-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          eventId,
          digitalSignature: signature,
        }),
      });
      
      onAccept();
    } catch (error) {
      console.error('Error accepting terms:', error);
      // Mostrar error al usuario
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consent-modal">
      <h2>Términos y Condiciones</h2>
      <div className="terms-content">
        <h3>Términos y Condiciones Generales de Inker</h3>
        <p>Al aceptar estos términos, confirmas tu acuerdo con las condiciones del servicio y el proceso de tatuaje.</p>
        
        <label>
          <input type="checkbox" required />
          Acepto los términos y condiciones generales de la plataforma Inker
        </label>
        
        <label>
          <input type="checkbox" required />
          Confirmo que he leído y entiendo los riesgos asociados con el proceso de tatuaje
        </label>
        
        <label>
          <input type="checkbox" required />
          Autorizo el procesamiento de mis datos personales conforme a la política de privacidad
        </label>
        
        <div className="signature-section">
          <label>Firma Digital (nombre completo):</label>
          <input 
            type="text" 
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Escribe tu nombre completo"
            required
          />
        </div>
      </div>
      
      <div className="modal-actions">
        <button onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button 
          onClick={handleAccept} 
          disabled={!signature || loading}
        >
          {loading ? 'Aceptando...' : 'Aceptar Términos'}
        </button>
      </div>
    </div>
  );
}
```

### **Paso 4: Componente Principal del Evento**

```typescript
function EventDetailsPage({ eventId }: { eventId: string }) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [eventActions, setEventActions] = useState<EventActions | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    Promise.all([
      checkConsentStatus(eventId),
      getEventActions(eventId),
    ]).then(([consent, actions]) => {
      setConsentStatus(consent);
      setEventActions(actions);
    });
  }, [eventId]);

  const handleConfirmEvent = async () => {
    // Verificar si necesita aceptar términos primero
    if (!consentStatus?.hasSigned && eventActions?.canAcceptConsent) {
      setShowConsentModal(true);
      return;
    }

    // Proceder con confirmación normal
    await confirmEvent(eventId);
  };

  const handleConsentAccepted = () => {
    setShowConsentModal(false);
    // Refrescar estado del consent
    checkConsentStatus(eventId).then(setConsentStatus);
    // Ahora proceder con confirmación
    confirmEvent(eventId);
  };

  return (
    <div className="event-details">
      {/* Detalles del evento */}
      
      <div className="event-actions">
        {eventActions?.canConfirmEvent && (
          <button onClick={handleConfirmEvent}>
            Confirmar Evento
          </button>
        )}
        
        {eventActions?.canAcceptConsent && !consentStatus?.hasSigned && (
          <button onClick={() => setShowConsentModal(true)}>
            Revisar Términos y Condiciones
          </button>
        )}
      </div>

      {showConsentModal && (
        <ConsentModal
          eventId={eventId}
          onAccept={handleConsentAccepted}
          onCancel={() => setShowConsentModal(false)}
        />
      )}
    </div>
  );
}
```

## 🎨 Componentes de UI Recomendados

### **Badge de Estado del Consent**
```typescript
function ConsentStatusBadge({ consentStatus }: { consentStatus: ConsentStatus }) {
  if (consentStatus.hasSigned) {
    return (
      <span className="consent-badge consent-signed">
        ✅ Términos Aceptados
      </span>
    );
  }
  
  return (
    <span className="consent-badge consent-pending">
      ⏳ Términos Pendientes
    </span>
  );
}
```

### **Indicador en Lista de Eventos**
```typescript
function EventListItem({ event }: { event: Event }) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    checkConsentStatus(event.id).then(setConsentStatus);
  }, [event.id]);

  return (
    <div className="event-item">
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>{event.date}</p>
      </div>
      
      <div className="event-status">
        {consentStatus && <ConsentStatusBadge consentStatus={consentStatus} />}
        <span className="event-status-badge">{event.status}</span>
      </div>
    </div>
  );
}
```

## 🚨 Manejo de Errores

```typescript
const CONSENT_ERRORS = {
  409: 'Ya has aceptado los términos para este evento',
  404: 'Evento no encontrado',
  400: 'No se pueden aceptar términos para eventos en este estado',
  403: 'Solo los customers pueden aceptar términos',
};

function handleConsentError(error: Response) {
  const message = CONSENT_ERRORS[error.status as keyof typeof CONSENT_ERRORS] 
    || 'Error al procesar términos y condiciones';
  
  // Mostrar error en UI
  showErrorMessage(message);
}
```

## 📱 Estados de la UI

1. **Loading**: Verificando estado del consent
2. **Términos Pendientes**: Mostrar botón "Revisar Términos"
3. **Términos Aceptados**: Mostrar badge verde ✅
4. **Modal Abierto**: Formulario de aceptación
5. **Procesando**: Loading al aceptar términos

## 🔧 Configuración Base de Datos

Ejecutar el script SQL para crear el template por defecto:

```sql
-- Ejecutar el archivo: create-default-consent-template.sql
```

## 🧪 Testing

### **Casos de Prueba Principales:**

1. ✅ Customer puede verificar estado del consent
2. ✅ Customer puede aceptar términos por defecto
3. ✅ No puede confirmar evento sin aceptar términos
4. ✅ No puede aceptar términos dos veces
5. ✅ Artist no ve opción de aceptar términos
6. ✅ Estado se actualiza en tiempo real

### **Casos Edge:**

- Evento no existe
- Usuario no autorizado
- Términos ya aceptados
- Estado del evento no permite aceptación

---

¡Con esta implementación tienes un sistema completo de consentimientos para tu MVP! 🎉 