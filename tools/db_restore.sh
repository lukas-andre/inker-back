#!/bin/bash

# Validación de argumentos
if [ $# -ne 1 ]; then
  echo "Uso: $0 /ruta/al/directorio/docker-compose"
  exit 1
fi

DOCKER_COMPOSE_DIR=$1
DOCKER_COMPOSE_PATH="$DOCKER_COMPOSE_DIR/docker-compose.yml"

# Validación de existencia de docker-compose.yml
if [ ! -f "$DOCKER_COMPOSE_PATH" ]; then
  echo "Error: docker-compose.yml no encontrado en $DOCKER_COMPOSE_PATH"
  exit 1
fi

# Configuración
POSTGRES_USER="root"
POSTGRES_PASSWORD="root"
POSTGRES_HOST="database"
POSTGRES_PORT="5432"
BACKUP_DIR="/Users/lhenry/Development/inker-back/backups"  # Cambiado a la carpeta correcta

# Encuentra archivos .backup
BACKUP_FILES=$(find "$BACKUP_DIR" -type f -name "*.backup")

# Itera sobre los archivos de respaldo
for file in $BACKUP_FILES; do
  echo "Restaurando el archivo de respaldo: $file"

  # Extracción del nombre de la base de datos
  DB_NAME=$(basename "$file" | cut -d '-' -f 1-2 | cut -d '_' -f 1)
  
  # Creación de la base de datos
  if ! docker-compose -f "$DOCKER_COMPOSE_PATH" exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" database createdb -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -T template0 "$DB_NAME"; then
      echo "Advertencia: La base de datos $DB_NAME podría ya existir o la creación falló. Continuando..."
  fi

  # Obtención del ID del contenedor
  CONTAINER_ID=$(docker-compose -f "$DOCKER_COMPOSE_PATH" ps -q database)
  if [[ -z "$CONTAINER_ID" ]]; then
      echo "Error: No se pudo encontrar el contenedor de la base de datos. ¿Está el contenedor en ejecución?"
      exit 1
  fi

  # Copia y restauración del archivo
  echo "Copiando $file al contenedor..."
  docker cp "$file" "$CONTAINER_ID:/tmp/restore.backup"
  
  echo "Restaurando base de datos $DB_NAME..."
  if ! docker-compose -f "$DOCKER_COMPOSE_PATH" exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" database pg_restore -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -Fc -d "$DB_NAME" /tmp/restore.backup; then
      echo "Error: Falló la restauración de la base de datos $DB_NAME desde $file"
  fi

  # Limpieza
  docker-compose -f "$DOCKER_COMPOSE_PATH" exec -T database rm /tmp/restore.backup

done

echo "Restauración completada."