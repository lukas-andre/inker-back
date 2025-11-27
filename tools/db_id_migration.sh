#!/bin/bash

# Configuración
DOCKER_COMPOSE_DIR="./database"  # Ajusta esta ruta a tu directorio docker-compose
DOCKER_COMPOSE_FILE="$DOCKER_COMPOSE_DIR/docker-compose.yml"

# Configuración de PostgreSQL
POSTGRES_USER="root"
POSTGRES_PASSWORD="root"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

# Directorios para scripts de migración
MIGRATION_DIR="./migration_scripts"
DATE=$(date +%Y%m%d_%H%M%S)

# Crea el directorio si no existe
mkdir -p "$MIGRATION_DIR"

# Obtener el ID del contenedor
CONTAINER_ID=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q database 2>/dev/null)
if [ -z "$CONTAINER_ID" ]; then
    echo "Intentando obtener el ID del contenedor directamente..."
    CONTAINER_ID=$(docker ps -q --filter "name=database")
    
    if [ -z "$CONTAINER_ID" ]; then
        echo "Error: No se pudo encontrar el contenedor de base de datos"
        exit 1
    fi
fi

echo "ID del contenedor: $CONTAINER_ID"

# Función para ejecutar comandos en el contenedor
run_in_container() {
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER_ID" "$@"
}

# Obtener la lista de bases de datos con prefijo inker-
echo "Obteniendo lista de bases de datos con prefijo inker-..."
DATABASES=$(run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname LIKE 'inker-%';")

if [ -z "$DATABASES" ]; then
    echo "No se encontraron bases de datos con el prefijo inker-"
    exit 1
fi

echo "Bases de datos encontradas: $DATABASES"

# Crear el script de función de migración
cat > "$MIGRATION_DIR/uuid_migration_function.sql" <<'EOF'
-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para generar el script de migración a UUID
CREATE OR REPLACE FUNCTION generate_uuid_migration_script(
    p_schema_name TEXT DEFAULT 'public'
) RETURNS TEXT AS $$
DECLARE
    v_table RECORD;
    v_result TEXT := '';
    v_column RECORD;
    v_fk RECORD;
    v_schema_name TEXT := p_schema_name;
BEGIN
    -- Iniciar el script
    v_result := v_result || '-- Script generado para migrar IDs a UUID' || E'\n';
    v_result := v_result || 'BEGIN;' || E'\n\n';
    
    -- Crear extensión UUID si no existe
    v_result := v_result || 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' || E'\n\n';
    
    -- Primero encontrar todas las tablas con columna id de tipo entero
    FOR v_table IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = v_schema_name
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        -- Verificar si la tabla tiene una columna id de tipo entero
        SELECT c.column_name, c.data_type
        FROM information_schema.columns c
        WHERE c.table_schema = v_schema_name
        AND c.table_name = v_table.table_name
        AND c.column_name = 'id'
        AND c.data_type IN ('integer', 'bigint', 'smallint')
        INTO v_column;
        
        IF v_column.column_name IS NOT NULL THEN
            v_result := v_result || '-- Tabla: ' || v_table.table_name || E'\n';
            v_result := v_result || '-- Creando tabla de mapeo para ' || v_table.table_name || E'\n';
            v_result := v_result || 'CREATE TABLE ' || v_table.table_name || '_id_map AS ' || E'\n';
            v_result := v_result || 'SELECT id AS old_id, uuid_generate_v4() AS new_id ' || E'\n';
            v_result := v_result || 'FROM ' || v_table.table_name || ';' || E'\n\n';
            
            v_result := v_result || 'CREATE INDEX ON ' || v_table.table_name || '_id_map (old_id);' || E'\n\n';
            
            v_result := v_result || '-- Creando respaldo de la tabla ' || v_table.table_name || E'\n';
            v_result := v_result || 'CREATE TABLE ' || v_table.table_name || '_backup AS ' || E'\n';
            v_result := v_result || 'SELECT * FROM ' || v_table.table_name || ';' || E'\n\n';
            
            v_result := v_result || '-- Añadiendo columna temporal UUID' || E'\n';
            v_result := v_result || 'ALTER TABLE ' || v_table.table_name || ' ADD COLUMN temp_uuid UUID;' || E'\n\n';
            
            v_result := v_result || '-- Llenando la columna temporal' || E'\n';
            v_result := v_result || 'UPDATE ' || v_table.table_name || ' t ' || E'\n';
            v_result := v_result || 'SET temp_uuid = m.new_id ' || E'\n';
            v_result := v_result || 'FROM ' || v_table.table_name || '_id_map m ' || E'\n';
            v_result := v_result || 'WHERE t.id = m.old_id;' || E'\n\n';
        END IF;
    END LOOP;
    
    -- Ahora generar la lista de todas las claves foráneas
    v_result := v_result || '-- Preparando para actualizar claves foráneas' || E'\n\n';
    
    FOR v_fk IN
        SELECT
            tc.table_name AS source_table,
            kcu.column_name AS source_column,
            ccu.table_name AS target_table,
            ccu.column_name AS target_column,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = v_schema_name
            AND ccu.column_name = 'id'
    LOOP
        -- Verificar si la tabla de destino está siendo migrada
        PERFORM 1
        FROM information_schema.columns c
        WHERE c.table_schema = v_schema_name
        AND c.table_name = v_fk.target_table
        AND c.column_name = 'id'
        AND c.data_type IN ('integer', 'bigint', 'smallint');
        
        IF FOUND THEN
            v_result := v_result || '-- Añadiendo columna temporal para FK en ' || v_fk.source_table || '.' || v_fk.source_column || E'\n';
            v_result := v_result || 'ALTER TABLE ' || v_fk.source_table || ' ADD COLUMN ' || v_fk.source_column || '_uuid UUID;' || E'\n\n';
            
            v_result := v_result || '-- Actualizando valores de FK' || E'\n';
            v_result := v_result || 'UPDATE ' || v_fk.source_table || ' s ' || E'\n';
            v_result := v_result || 'SET ' || v_fk.source_column || '_uuid = m.new_id ' || E'\n';
            v_result := v_result || 'FROM ' || v_fk.target_table || '_id_map m ' || E'\n';
            v_result := v_result || 'WHERE s.' || v_fk.source_column || ' = m.old_id;' || E'\n\n';
        END IF;
    END LOOP;
    
    -- Ahora actualizar las estructuras de las tablas principales
    v_result := v_result || '-- Actualizando estructuras de tablas principales' || E'\n\n';
    
    FOR v_table IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = v_schema_name
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        -- Verificar si la tabla tiene una columna id de tipo entero
        SELECT c.column_name, c.data_type
        FROM information_schema.columns c
        WHERE c.table_schema = v_schema_name
        AND c.table_name = v_table.table_name
        AND c.column_name = 'id'
        AND c.data_type IN ('integer', 'bigint', 'smallint')
        INTO v_column;
        
        IF v_column.column_name IS NOT NULL THEN
            v_result := v_result || '-- Actualizando estructura de ' || v_table.table_name || E'\n';
            
            -- Encontrar el nombre de la restricción PK
            DECLARE
                v_pk_name TEXT;
            BEGIN
                SELECT constraint_name INTO v_pk_name
                FROM information_schema.table_constraints
                WHERE table_schema = v_schema_name
                AND table_name = v_table.table_name
                AND constraint_type = 'PRIMARY KEY';
                
                IF v_pk_name IS NOT NULL THEN
                    v_result := v_result || 'ALTER TABLE ' || v_table.table_name || ' DROP CONSTRAINT ' || v_pk_name || ';' || E'\n';
                END IF;
            END;
            
            v_result := v_result || 'ALTER TABLE ' || v_table.table_name || ' ' || E'\n';
            v_result := v_result || '    ALTER COLUMN id TYPE UUID USING temp_uuid,' || E'\n';
            v_result := v_result || '    ALTER COLUMN id SET NOT NULL,' || E'\n';
            v_result := v_result || '    ADD PRIMARY KEY (id),' || E'\n';
            v_result := v_result || '    DROP COLUMN temp_uuid;' || E'\n\n';
        END IF;
    END LOOP;
    
    -- Ahora actualizar las claves foráneas
    v_result := v_result || '-- Actualizando claves foráneas' || E'\n\n';
    
    FOR v_fk IN
        SELECT
            tc.table_name AS source_table,
            kcu.column_name AS source_column,
            ccu.table_name AS target_table,
            ccu.column_name AS target_column,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = v_schema_name
            AND ccu.column_name = 'id'
    LOOP
        -- Verificar si la tabla de destino está siendo migrada
        PERFORM 1
        FROM information_schema.columns c
        WHERE c.table_schema = v_schema_name
        AND c.table_name = v_fk.target_table
        AND c.column_name = 'id'
        AND c.data_type IN ('integer', 'bigint', 'smallint');
        
        IF FOUND THEN
            v_result := v_result || '-- Actualizando FK en ' || v_fk.source_table || E'\n';
            
            -- Eliminar la restricción FK existente
            v_result := v_result || 'ALTER TABLE ' || v_fk.source_table || ' DROP CONSTRAINT ' || v_fk.constraint_name || ';' || E'\n';
            
            -- Actualizar la columna
            v_result := v_result || 'ALTER TABLE ' || v_fk.source_table || ' ' || E'\n';
            v_result := v_result || '    ALTER COLUMN ' || v_fk.source_column || ' TYPE UUID USING ' || v_fk.source_column || '_uuid,' || E'\n';
            v_result := v_result || '    DROP COLUMN ' || v_fk.source_column || '_uuid;' || E'\n\n';
            
            -- Agregar nueva restricción FK
            v_result := v_result || 'ALTER TABLE ' || v_fk.source_table || ' ' || E'\n';
            v_result := v_result || '    ADD CONSTRAINT ' || v_fk.constraint_name || ' ' || E'\n';
            v_result := v_result || '    FOREIGN KEY (' || v_fk.source_column || ') ' || E'\n';
            v_result := v_result || '    REFERENCES ' || v_fk.target_table || '(id);' || E'\n\n';
        END IF;
    END LOOP;
    
    -- Eliminar tablas temporales de mapeo
    v_result := v_result || '-- Eliminando tablas temporales de mapeo' || E'\n\n';
    
    FOR v_table IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = v_schema_name
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        -- Verificar si la tabla tiene una columna id de tipo entero
        SELECT c.column_name, c.data_type
        FROM information_schema.columns c
        WHERE c.table_schema = v_schema_name
        AND c.table_name = v_table.table_name
        AND c.column_name = 'id'
        AND c.data_type IN ('integer', 'bigint', 'smallint')
        INTO v_column;
        
        IF v_column.column_name IS NOT NULL THEN
            v_result := v_result || 'DROP TABLE ' || v_table.table_name || '_id_map;' || E'\n';
            -- Nota: No eliminamos la tabla de backup por seguridad
        END IF;
    END LOOP;
    
    -- Finalizar el script
    v_result := v_result || E'\nCOMMIT;' || E'\n';
    v_result := v_result || '-- Fin del script de migración' || E'\n';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
EOF

echo "Instalando función de migración en cada base de datos..."

for db in $DATABASES; do
    db=$(echo "$db" | tr -d ' ')  # Elimina espacios en blanco
    if [ ! -z "$db" ]; then
        echo "===================================================================="
        echo "Procesando base de datos: $db"
        echo "===================================================================="
        
        # Instalar la función de migración en la base de datos
        echo "Instalando función de migración en $db..."
        run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db" -f - < "$MIGRATION_DIR/uuid_migration_function.sql"
        
        if [ $? -eq 0 ]; then
            echo "✓ Función de migración instalada en $db"
            
            # Generar el script de migración para esta base de datos
            echo "Generando script de migración para $db..."
            # Usando comillas simples para el valor por defecto
            run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db" -t -c "SELECT generate_uuid_migration_script('public');" > "$MIGRATION_DIR/${db}_migration_$DATE.sql"
            
            if [ $? -eq 0 ]; then
                echo "✓ Script de migración generado: $MIGRATION_DIR/${db}_migration_$DATE.sql"
                
                # Preguntar si ejecutar la migración ahora
                read -p "¿Deseas ejecutar la migración para $db ahora? (s/n): " EXECUTE_MIGRATION
                if [[ "$EXECUTE_MIGRATION" =~ ^[Ss]$ ]]; then
                    echo "Ejecutando migración para $db..."
                    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db" -f - < "$MIGRATION_DIR/${db}_migration_$DATE.sql"
                    
                    if [ $? -eq 0 ]; then
                        echo "✓ Migración completada exitosamente para $db"
                    else
                        echo "✗ Error durante la migración de $db"
                        echo "  Si es necesario, puedes restaurar desde el backup"
                    fi
                else
                    echo "Migración para $db omitida. Puedes ejecutarla manualmente más tarde."
                    echo "Para ejecutar manualmente, usa:"
                    echo "cat $MIGRATION_DIR/${db}_migration_$DATE.sql | docker exec -i $CONTAINER_ID psql -U $POSTGRES_USER -d $db"
                fi
            else
                echo "✗ Error al generar el script de migración para $db"
            fi
        else
            echo "✗ Error al instalar la función de migración en $db"
        fi
    fi
done

echo "Proceso completado."
echo "Los scripts de migración están en: $MIGRATION_DIR"