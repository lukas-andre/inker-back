# Reglas de Negocio y Mejores Prácticas para Reprogramación de Eventos en Plataformas de Tatuajes  

## Marco General de Políticas  
Basado en análisis de 15+ estudios de casos y políticas de estudios de tatuajes líderes ([3][5][7][9][17][18]):  

### 1. **Derechos de Reprogramación por Rol**  
| Rol       | Permisos                                                                 | Restricciones                                                                                   |  
|-----------|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|  
| **Artista** | - Reprogramar en cualquier momento                                       | - Notificar al cliente con 72h+ de anticipación para cambios no urgentes                       |  
|           | - Modificar duración, ubicación o detalles técnicos                     | - Aplicar penalización económica automática si reduce el tiempo de sesión programada            |  
| **Cliente** | - Solicitar reprogramación con 48-72h de anticipación                   | - Máximo 2 reprogramaciones por evento (límite para evitar abusos) [3][7][9]                   |  
|           | - Elegir nuevas fechas dentro del horario laboral publicado del artista | - Penalización del 20-50% del depósito si incumple plazos [5][9]                               |  

---

## Modelo de Ventanas de Tiempo  
  
*(Ejemplo visual de plazos basado en [7][9][17])*  

### 2. **Jerarquía de Prioridades**  
1. **Emergencias médicas** (con certificado): Sin penalizaciones para ninguna parte [5][9]  
2. **Conflictos laborales/documentados**: 25% de penalización máxima  
3. **Preferencias personales**: 50-100% de penalización según proximidad al evento [3][5]  

---

## Mecanismos de Control  

### 3. **Sistema de Reputación Integrado**  
- **Artistas**:  
  - -2 pts por reprogramación con <24h de anticipación  
  - +1 pt por aceptar reprogramaciones complejas [13][15]  

- **Clientes**:  
  - -1 pt por cada reprogramación adicional después del límite permitido  
  - Bloqueo temporal tras 3 infracciones en 6 meses [3][7]  

### 4. **Flujo de Notificaciones Automatizadas**  
1. **Alerta Primaria**: Mensaje in-app + email al solicitar cambio  
2. **Confirmación Obligatoria**: Requiere aceptación explícita de ambas partes dentro de 12h  
3. **Sincronización Cross-Calendario**: Actualización automática en agendas vinculadas [12][14]  

---

## Mejores Prácticas Comprobadas  

### 5. **Transparencia Operativa**  
- Publicar políticas de reprogramación en:  
  - Proceso de reserva (3 puntos de confirmación) [17][18]  
  - Sección FAQ del perfil del artista [7]  
  - Recordatorio automático 72h antes del evento [12]  

### 6. **Equilibrio de Poderes**  
- **Artistas**: Derecho a rechazar 1 reprogramación cliente/mes sin afectar reputación [3][5]  
- **Clientes**: Opción de reembolso completo si artista reprograma 2+ veces sin causa válida [9][18]  

### 7. **Prevención de Abusos**  
- **Límites Técnicos**:  
  - Bloqueo automático tras 3 solicitudes de reprogramación en <7 días  
  - Verificación de identidad biométrica para cambios de última hora [14]  

---

## Modelo de Penalizaciones Adaptativo  

| Factor                      | Artista                     | Cliente                      |  
|-----------------------------|----------------------------|------------------------------|  
| **Primera reprogramación**  | Sin costo                  | 10% del depósito [7]         |  
| **Segunda reprogramación**  | 15% de descuento obligatorio | 25% del depósito [9]         |  
| **Tercera+ reprogramación** | Pérdida automática de slot | 100% del depósito [3][5]     |  

---

**Conclusión Operativa**:  
Los datos muestran que permitir reprogramaciones controladas a ambos roles reduce los no-shows en 38% ([12][14]). La clave está en:  
1. Automatizar penalizaciones proporcionales  
2. Mantener flexibilidad para casos excepcionales documentados  
3. Integrar sistemas de reputación que incentiven el cumplimiento  

**Recomendación Final**:  
Implementar un sistema híbrido donde:  
- **Artistas** tengan libertad total pero con consecuencias en su ranking público  
- **Clientes** disfruten 2 reprogramaciones libres/año antes de aplicar restricciones  
- **Excepciones** se manejen mediante comité interno con respuesta en <4h [14][18]  

