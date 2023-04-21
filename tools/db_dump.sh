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
BACKUP_DIR="/Users/Ihenry/Lucas/inker/inker-back/database/backup"
TEMP_BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d)

# Lista de bases de datos a respaldar, separadas por espacios
DATABASES="inker-agenda inker-artist inker-customer inker-customer-feed inker-follow inker-genre inker-location inker-post inker-reaction inker-review inker-tag inker-user"

# Crea el directorio de respaldo si no existe
mkdir -p $BACKUP_DIR

# Crea el directorio temporal de respaldo en el contenedor
docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml exec -T -e PGPASSWORD=$POSTGRES_PASSWORD database mkdir -p $TEMP_BACKUP_DIR

# Realiza el respaldo de cada base de datos
for db in $DATABASES; do
  echo "Respaldando la base de datos: $db"
  docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml exec -T -e PGPASSWORD=$POSTGRES_PASSWORD database pg_dump -U $POSTGRES_USER -h localhost -p $POSTGRES_PORT -F t -b -f "$TEMP_BACKUP_DIR/$db-$DATE.tar" $db
  
  # Copia el respaldo desde el contenedor a la máquina local
  CONTAINER_ID=$(docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.yml ps -q database)
  docker cp $CONTAINER_ID:$TEMP_BACKUP_DIR/$db-$DATE.tar $BACKUP_DIR/$db-$DATE.tar
done

# Elimina los respaldos antiguos (mayores a 7 días)
find $BACKUP_DIR -type f -mtime +7 -exec rm {} \;

echo "Respaldo completado."
