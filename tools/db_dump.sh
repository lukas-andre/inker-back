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

# Directorios de backup (usando el directorio actual como base)
BACKUP_DIR="./backups"
TEMP_BACKUP_DIR="/tmp/pg_backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Crea el directorio de backup local si no existe
mkdir -p "$BACKUP_DIR"

# Función para ejecutar comandos en el contenedor de PostgreSQL
run_in_container() {
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" database "$@"
}

# Verifica que el contenedor está corriendo
CONTAINER_ID=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q database)
if [ -z "$CONTAINER_ID" ]; then
    echo "Error: El contenedor de base de datos no está corriendo"
    exit 1
fi

echo "Creando directorio temporal en el contenedor..."
run_in_container mkdir -p "$TEMP_BACKUP_DIR"

# Obtiene la lista de bases de datos
echo "Obteniendo lista de bases de datos..."
DATABASES=$(run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname NOT IN ('postgres');")

# Verifica si se obtuvieron bases de datos
if [ -z "$DATABASES" ]; then
    echo "Error: No se encontraron bases de datos para respaldar"
    echo "Debugging: Mostrando todas las bases de datos..."
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -l
    exit 1
fi

# Respaldo de todas las bases de datos
echo "Iniciando respaldo de bases de datos..."
echo "Bases de datos encontradas: $DATABASES"

for db in $DATABASES; do
    db=$(echo "$db" | tr -d ' ')  # Elimina espacios en blanco
    if [ ! -z "$db" ]; then
        echo "Respaldando base de datos: $db"
        
        # Realiza el respaldo
        run_in_container pg_dump -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
            -F c -b -v -f "$TEMP_BACKUP_DIR/$db-$DATE.backup" "$db"
        
        if [ $? -eq 0 ]; then
            # Copia el respaldo desde el contenedor
            echo "Copiando backup desde el contenedor..."
            docker cp "$CONTAINER_ID:$TEMP_BACKUP_DIR/$db-$DATE.backup" "$BACKUP_DIR/$db-$DATE.backup"
            
            if [ $? -eq 0 ]; then
                echo "✓ Respaldo completado exitosamente: $db"
                # Limpia el archivo temporal en el contenedor
                run_in_container rm "$TEMP_BACKUP_DIR/$db-$DATE.backup"
            else
                echo "✗ Error al copiar el respaldo de $db desde el contenedor"
            fi
        else
            echo "✗ Error al crear el respaldo de $db"
        fi
    fi
done

# Limpia respaldos antiguos
echo "Limpiando respaldos antiguos (más de $RETENTION_DAYS días)..."
find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -exec rm -f {} \;

echo "Proceso de respaldo completado."