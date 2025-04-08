#!/bin/bash

# Verifica los argumentos
if [ $# -ne 1 ]; then
    echo "Uso: $0 /ruta/al/directorio/docker-compose"
    exit 1
fi

# Configuración
DOCKER_COMPOSE_DIR="$1"
DOCKER_COMPOSE_FILE="$DOCKER_COMPOSE_DIR/docker-compose.yml"

# Verifica que el archivo docker-compose existe
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo "Error: No se encuentra el archivo docker-compose.yml en $DOCKER_COMPOSE_DIR"
    exit 1
fi

# Configuración de PostgreSQL
POSTGRES_USER="root"
POSTGRES_PASSWORD="root"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

# Directorios de backup
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Prefijo de las bases de datos a procesar
DB_PREFIX="inker-"

# Crea el directorio de backup local si no existe
mkdir -p "$BACKUP_DIR"

# Obtener el ID del contenedor
CONTAINER_ID=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q database)
if [ -z "$CONTAINER_ID" ]; then
    echo "Error: No se pudo encontrar el contenedor de base de datos"
    exit 1
fi

# Función para ejecutar comandos directamente en el contenedor (sin docker-compose)
run_in_container() {
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER_ID" "$@"
}

echo "Obteniendo lista de bases de datos con prefijo $DB_PREFIX..."
DATABASES=$(run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname LIKE '$DB_PREFIX%';")

if [ -z "$DATABASES" ]; then
    echo "No se encontraron bases de datos con el prefijo $DB_PREFIX"
    echo "Listando todas las bases de datos disponibles:"
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
    exit 1
fi

echo "Bases de datos encontradas: $DATABASES"

# Crear script de backup para pg_dumpall (solo para las bases que nos interesan)
cat > "$BACKUP_DIR/dump_script.sql" <<EOL
\c postgres
$(for db in $DATABASES; do echo "\echo 'Creando dump de $db...'\n\\o '$BACKUP_DIR/$db-$DATE.sql'\n\\c $db\n\\dt\n"; done)
EOL

# Ejecutar los backups uno por uno
for db in $DATABASES; do
    db=$(echo "$db" | tr -d ' ')  # Elimina espacios en blanco
    if [ ! -z "$db" ]; then
        echo "Respaldando base de datos: $db"
        
        # Realizar el respaldo directamente a un archivo local usando redirección
        run_in_container pg_dump -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db" > "$BACKUP_DIR/$db-$DATE.sql"
        
        if [ $? -eq 0 ]; then
            echo "✓ Respaldo de $db completado exitosamente"
            
            # Comprimir el backup
            gzip -f "$BACKUP_DIR/$db-$DATE.sql"
            echo "  Backup comprimido: $BACKUP_DIR/$db-$DATE.sql.gz"
        else
            echo "✗ Error al crear el respaldo de $db"
        fi
    fi
done

# Limpia respaldos antiguos
echo "Limpiando respaldos antiguos (más de $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} \;

echo "Proceso de respaldo completado."
echo "Los backups están en: $BACKUP_DIR"