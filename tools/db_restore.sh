#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Uso: $0 /ruta/al/docker-compose"
  exit 1
fi

DOCKER_COMPOSE_PATH=$1

# Configuración
POSTGRES_USER="root"
POSTGRES_PASSWORD="root"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
BACKUP_DIR="/Users/noname/Dev/inker-back/database/backup"

# Encuentra todos los archivos .tar en el directorio de respaldo
BACKUP_FILES=$(find $BACKUP_DIR -type f -name "*.tar")

# Restaura cada archivo de respaldo en la base de datos correspondiente
for file in $BACKUP_FILES; do
  echo "Restaurando el archivo de respaldo: $file"
  
  # Extrae el nombre de la base de datos del nombre del archivo
  DB_NAME=$(basename $file | sed 's/-.*//')
  
  # Crea la base de datos en caso de que no exista
  docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml exec -T -e PGPASSWORD=$POSTGRES_PASSWORD database createdb -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -T template0 $DB_NAME
  
  # Restaura la base de datos
  CONTAINER_ID=$(docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml ps -q database)
  docker cp $file $CONTAINER_ID:/tmp/restore.tar
  docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml exec -T -e PGPASSWORD=$POSTGRES_PASSWORD database pg_restore -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -F t -d $DB_NAME -C /tmp/restore.tar
  docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml exec -T -e PGPASSWORD=$POSTGRES_PASSWORD database rm /tmp/restore.tar
done

echo "Restauración completada."
