-- Añadir campo tsvector a la tabla works
ALTER TABLE works ADD COLUMN tsv tsvector;

-- Crear índice GIN para búsqueda rápida en el campo tsv
CREATE INDEX works_tsv_idx ON works USING GIN(tsv);

-- Crear función para actualizar el campo tsvector
CREATE OR REPLACE FUNCTION works_search_trigger() RETURNS trigger AS $$
BEGIN
  -- Actualizar campo tsv con texto combinado y ponderado de varios campos
  NEW.tsv := 
    -- Título con alto peso (A)
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    -- Descripción con peso medio (B)
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  
  -- También buscar en español
  NEW.tsv := NEW.tsv ||
    setweight(to_tsvector('spanish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.description, '')), 'B');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar el campo tsvector automáticamente
CREATE TRIGGER works_tsvector_update 
  BEFORE INSERT OR UPDATE OF title, description
  ON works 
  FOR EACH ROW 
  EXECUTE FUNCTION works_search_trigger();

-- Actualizar el campo tsvector para todos los registros existentes
UPDATE works SET tsv = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('spanish', coalesce(description, '')), 'B');

-- Crear función para actualizar el campo tsvector cuando se modifica una etiqueta relacionada
CREATE OR REPLACE FUNCTION update_work_tags_tsv() RETURNS trigger AS $$
DECLARE
  work_record RECORD;
  tag_text TEXT := '';
BEGIN
  -- Si se está añadiendo o actualizando una relación de etiqueta
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Obtenemos el trabajo relacionado
    SELECT w.* INTO work_record FROM works w WHERE w.id = NEW.work_id;
    
    -- Obtener texto de todas las etiquetas relacionadas con este trabajo
    SELECT string_agg(t.name, ' ') INTO tag_text
    FROM tags t 
    JOIN work_tags wt ON t.id = wt.tag_id 
    WHERE wt.work_id = NEW.work_id;
    
    -- Actualizar el campo tsv del trabajo para incluir las etiquetas
    UPDATE works SET tsv = 
      tsv || 
      setweight(to_tsvector('english', coalesce(tag_text, '')), 'C') ||
      setweight(to_tsvector('spanish', coalesce(tag_text, '')), 'C')
    WHERE id = NEW.work_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar campo tsv cuando se añaden/eliminan etiquetas
CREATE TRIGGER work_tags_tsvector_update
  AFTER INSERT OR UPDATE
  ON work_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_work_tags_tsv(); 