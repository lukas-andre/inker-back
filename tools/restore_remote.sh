#!/bin/bash

# Configuración de la base de datos remota
REMOTE_HOST="190.22.48.67"
REMOTE_USER="noname"
REMOTE_PORT="22"
REMOTE_DOCKER_CONTAINER="postgis"
BACKUP_DIR="./backups"

# Verifica que el directorio de backups existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: No se encuentra el directorio de backups"
    exit 1
fi

# Función para restaurar una base de datos
restore_database() {
    local backup_file=$1
    local db_name=$(basename "$backup_file" | sed 's/-[0-9]\{8\}_[0-9]\{6\}\.backup$//')
    local remote_backup_dir="/tmp/pg_restore"
    
    echo "Restaurando $db_name desde $backup_file..."
    
    # Copia el archivo de backup al servidor remoto
    echo "Copiando backup al servidor remoto..."
    ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $remote_backup_dir" > /dev/null 2>&1
    scp -P "$REMOTE_PORT" "$backup_file" "$REMOTE_USER@$REMOTE_HOST:$remote_backup_dir/" > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo "✗ Error al copiar el archivo al servidor remoto"
        return 1
    fi
    
    # Ejecuta los comandos de restauración en el servidor remoto
    remote_file="$remote_backup_dir/$(basename "$backup_file")"
    ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << EOF
        # Copia el archivo al contenedor Docker
        docker cp "$remote_file" $REMOTE_DOCKER_CONTAINER:/tmp/ > /dev/null 2>&1
        
        # Ejecuta los comandos de restauración dentro del contenedor
        docker exec -i $REMOTE_DOCKER_CONTAINER bash -c '
            # Obtiene las credenciales de los archivos secrets
            DB_USER=\$(cat /run/secrets/db_user)
            DB_PASSWORD=\$(cat /run/secrets/db_password)
            
            # Configura la variable de entorno para la contraseña
            export PGPASSWORD="\$DB_PASSWORD"
            
            # Desconecta usuarios existentes y elimina la base de datos si existe
            psql -U "\$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '"$db_name"' AND pid <> pg_backend_pid();" > /dev/null 2>&1
            dropdb -U "\$DB_USER" --if-exists "$db_name" > /dev/null 2>&1
            
            # Crea la base de datos con extensión PostGIS
            createdb -U "\$DB_USER" "$db_name" > /dev/null 2>&1
            psql -U "\$DB_USER" -d "$db_name" -c "CREATE EXTENSION IF NOT EXISTS postgis;" > /dev/null 2>&1
            
            # Restaura el backup sin pedir confirmación
            pg_restore -U "\$DB_USER" -d "$db_name" --no-owner --no-privileges --clean --if-exists -v "/tmp/$(basename "$remote_file")" > /dev/null 2>&1
            
            # Limpia el archivo temporal dentro del contenedor
            rm "/tmp/$(basename "$remote_file")" > /dev/null 2>&1
            
            # Limpia la variable de entorno
            unset PGPASSWORD
            
            echo "Restauración de $db_name completada"
        '
        
        # Limpia el archivo temporal en el host
        rm "$remote_file" > /dev/null 2>&1
EOF
    
    if [ $? -eq 0 ]; then
        echo "✓ Base de datos $db_name restaurada exitosamente"
    else
        echo "✗ Error al restaurar la base de datos $db_name"
    fi
}

echo "Iniciando restauración automática de todas las bases de datos..."
echo "Este proceso puede tomar varios minutos dependiendo del tamaño de los backups."

# Procesa cada archivo de backup
for backup_file in "$BACKUP_DIR"/*.backup; do
    if [ -f "$backup_file" ]; then
        restore_database "$backup_file"
    fi
done

echo "Proceso de restauración completado."