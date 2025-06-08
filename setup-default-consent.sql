-- ==========================================
-- SETUP SCRIPT: Default Consent Template
-- ==========================================
-- Ejecutar este script para configurar el template por defecto para MVP

-- Crear el template por defecto para términos y condiciones
INSERT INTO form_templates (
    id,
    title,
    content,
    version,
    consent_type,
    artist_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Términos y Condiciones Generales - Inker',
    '{
        "title": "Términos y Condiciones Generales de Inker",
        "description": "Al aceptar estos términos, confirmas tu acuerdo con las condiciones del servicio y el proceso de tatuaje.",
        "fields": [
            {
                "type": "checkbox",
                "label": "Acepto los términos y condiciones generales de la plataforma Inker",
                "name": "acceptGeneralTerms",
                "required": true,
                "options": [{"label": "Sí, acepto", "value": true}]
            },
            {
                "type": "checkbox", 
                "label": "Confirmo que he leído y entiendo los riesgos asociados con el proceso de tatuaje",
                "name": "acceptTattooRisks",
                "required": true,
                "options": [{"label": "Sí, confirmo", "value": true}]
            },
            {
                "type": "checkbox",
                "label": "Autorizo el procesamiento de mis datos personales conforme a la política de privacidad",
                "name": "acceptDataProcessing", 
                "required": true,
                "options": [{"label": "Sí, autorizo", "value": true}]
            },
            {
                "type": "text",
                "label": "Nombre completo",
                "name": "fullName",
                "required": true,
                "placeholder": "Ingresa tu nombre completo"
            },
            {
                "type": "signature",
                "label": "Firma Digital",
                "name": "digitalSignature",
                "required": true
            }
        ]
    }'::jsonb,
    1,
    'GENERAL_TERMS',
    '00000000-0000-0000-0000-000000000000',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó correctamente
SELECT 
    id,
    title,
    consent_type,
    is_active,
    created_at
FROM form_templates 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Confirmar datos
\echo '✅ Template de consentimiento por defecto creado exitosamente' 