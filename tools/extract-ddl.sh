#!/bin/bash

# DDL Extraction Script for InkerStudio PostgreSQL Databases
# This script extracts complete DDL (Data Definition Language) from all Inker databases

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verify arguments
if [ $# -ne 1 ]; then
    echo -e "${RED}Usage: $0 /path/to/docker-compose/directory${NC}"
    exit 1
fi

# Configuration
DOCKER_COMPOSE_DIR="$1"
DOCKER_COMPOSE_FILE="$DOCKER_COMPOSE_DIR/docker-compose.yml"

# Verify docker-compose file exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo -e "${RED}Error: docker-compose.yml not found in $DOCKER_COMPOSE_DIR${NC}"
    exit 1
fi

# PostgreSQL Configuration
POSTGRES_USER="root"
POSTGRES_PASSWORD="root"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

# Output directories
OUTPUT_BASE_DIR="./extracted_ddls"
DATE=$(date +%Y%m%d_%H%M%S)

# List of all InkerStudio databases
DATABASES=(
    "inker-agenda"
    "inker-analytics"
    "inker-artist"
    "inker-customer"
    "inker-follow"
    "inker-genre"
    "inker-location"
    "inker-notification"
    "inker-post"
    "inker-reaction"
    "inker-review"
    "inker-tag"
    "inker-tattoo-generation"
    "inker-test"
    "inker-tokens"
    "inker-user"
)

# Create main output directory
mkdir -p "$OUTPUT_BASE_DIR"

# Get container ID
echo -e "${BLUE}Finding database container...${NC}"
CONTAINER_ID=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q database)
if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}Error: Database container not found${NC}"
    exit 1
fi

echo -e "${GREEN}Container found: $CONTAINER_ID${NC}"

# Function to run commands in container
run_in_container() {
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER_ID" "$@"
}

# Function to extract DDL components
extract_ddl_component() {
    local db_name=$1
    local component=$2
    local output_file=$3
    local pg_dump_options=$4
    
    echo -e "  ${BLUE}Extracting $component...${NC}"
    run_in_container pg_dump -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
        -d "$db_name" \
        --schema-only \
        --no-owner \
        --no-privileges \
        $pg_dump_options > "$output_file" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -s "$output_file" ]; then
        echo -e "  ${GREEN}✓ $component extracted${NC}"
        return 0
    else
        echo -e "  ${YELLOW}⚠ No $component found or extraction failed${NC}"
        rm -f "$output_file"
        return 1
    fi
}

# Function to extract specific database objects
extract_database_objects() {
    local db_name=$1
    local db_dir=$2
    
    echo -e "${YELLOW}Extracting objects for $db_name...${NC}"
    
    # Extract complete schema first
    extract_ddl_component "$db_name" "complete schema" \
        "$db_dir/00_complete_schema.sql" ""
    
    # Extract tables only
    extract_ddl_component "$db_name" "tables" \
        "$db_dir/01_tables.sql" "--section=pre-data --section=data --section=post-data -t '*'"
    
    # Extract indexes
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'CREATE ' || 
            CASE WHEN i.indisunique THEN 'UNIQUE ' ELSE '' END ||
            'INDEX ' || quote_ident(c.relname) || ' ON ' || 
            quote_ident(n.nspname) || '.' || quote_ident(t.relname) || ' ' ||
            pg_get_indexdef(i.indexrelid, 0, true) || ';'
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND NOT i.indisprimary;" > "$db_dir/02_indexes.sql" 2>/dev/null
    
    if [ -s "$db_dir/02_indexes.sql" ]; then
        echo -e "  ${GREEN}✓ Indexes extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No indexes found${NC}"
        rm -f "$db_dir/02_indexes.sql"
    fi
    
    # Extract constraints
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'ALTER TABLE ' || quote_ident(n.nspname) || '.' || quote_ident(t.relname) || 
            ' ADD CONSTRAINT ' || quote_ident(c.conname) || ' ' ||
            pg_get_constraintdef(c.oid) || ';'
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND c.contype IN ('f', 'c', 'u');" > "$db_dir/03_constraints.sql" 2>/dev/null
    
    if [ -s "$db_dir/03_constraints.sql" ]; then
        echo -e "  ${GREEN}✓ Constraints extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No constraints found${NC}"
        rm -f "$db_dir/03_constraints.sql"
    fi
    
    # Extract views
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'CREATE OR REPLACE VIEW ' || quote_ident(n.nspname) || '.' || quote_ident(c.relname) || 
            ' AS ' || pg_get_viewdef(c.oid, true) || ';'
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'v'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema');" > "$db_dir/04_views.sql" 2>/dev/null
    
    if [ -s "$db_dir/04_views.sql" ]; then
        echo -e "  ${GREEN}✓ Views extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No views found${NC}"
        rm -f "$db_dir/04_views.sql"
    fi
    
    # Extract functions
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT pg_get_functiondef(p.oid) || ';'
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema');" > "$db_dir/05_functions.sql" 2>/dev/null
    
    if [ -s "$db_dir/05_functions.sql" ]; then
        echo -e "  ${GREEN}✓ Functions extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No functions found${NC}"
        rm -f "$db_dir/05_functions.sql"
    fi
    
    # Extract triggers
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'CREATE TRIGGER ' || quote_ident(t.tgname) || 
            ' ' || CASE t.tgtype & 2 WHEN 2 THEN 'BEFORE' ELSE 'AFTER' END ||
            ' ' || CASE t.tgtype & 28
                WHEN 4 THEN 'INSERT'
                WHEN 8 THEN 'DELETE' 
                WHEN 12 THEN 'INSERT OR DELETE'
                WHEN 16 THEN 'UPDATE'
                WHEN 20 THEN 'INSERT OR UPDATE'
                WHEN 24 THEN 'UPDATE OR DELETE'
                WHEN 28 THEN 'INSERT OR UPDATE OR DELETE'
            END ||
            ' ON ' || quote_ident(n.nspname) || '.' || quote_ident(c.relname) ||
            ' FOR EACH ' || CASE t.tgtype & 1 WHEN 1 THEN 'ROW' ELSE 'STATEMENT' END ||
            ' EXECUTE FUNCTION ' || quote_ident(np.nspname) || '.' || quote_ident(p.proname) || '();'
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_proc p ON p.oid = t.tgfoid
        JOIN pg_namespace np ON np.oid = p.pronamespace
        WHERE NOT t.tgisinternal
        AND n.nspname NOT IN ('pg_catalog', 'information_schema');" > "$db_dir/06_triggers.sql" 2>/dev/null
    
    if [ -s "$db_dir/06_triggers.sql" ]; then
        echo -e "  ${GREEN}✓ Triggers extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No triggers found${NC}"
        rm -f "$db_dir/06_triggers.sql"
    fi
    
    # Extract sequences
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'CREATE SEQUENCE ' || quote_ident(n.nspname) || '.' || quote_ident(c.relname) || ';'
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'S'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema');" > "$db_dir/07_sequences.sql" 2>/dev/null
    
    if [ -s "$db_dir/07_sequences.sql" ]; then
        echo -e "  ${GREEN}✓ Sequences extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No sequences found${NC}"
        rm -f "$db_dir/07_sequences.sql"
    fi
    
    # Extract custom types and enums
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 
            'CREATE TYPE ' || quote_ident(n.nspname) || '.' || quote_ident(t.typname) || 
            ' AS ENUM (' || string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) || ');'
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        GROUP BY n.nspname, t.typname;" > "$db_dir/08_types.sql" 2>/dev/null
    
    if [ -s "$db_dir/08_types.sql" ]; then
        echo -e "  ${GREEN}✓ Custom types extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No custom types found${NC}"
        rm -f "$db_dir/08_types.sql"
    fi
    
    # Extract extensions
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db_name" -t -A -c "
        SELECT 'CREATE EXTENSION IF NOT EXISTS ' || quote_ident(extname) || ';'
        FROM pg_extension
        WHERE extname NOT IN ('plpgsql');" > "$db_dir/09_extensions.sql" 2>/dev/null
    
    if [ -s "$db_dir/09_extensions.sql" ]; then
        echo -e "  ${GREEN}✓ Extensions extracted${NC}"
    else
        echo -e "  ${YELLOW}⚠ No extensions found${NC}"
        rm -f "$db_dir/09_extensions.sql"
    fi
}

# Main extraction process
echo -e "${BLUE}Starting DDL extraction for InkerStudio databases...${NC}"
echo -e "${BLUE}Output directory: $OUTPUT_BASE_DIR${NC}"
echo ""

# Test connection first
echo -e "${BLUE}Testing database connection...${NC}"
run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -c "SELECT version();" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connection successful${NC}"
echo ""

# Process each database
SUCCESS_COUNT=0
FAILED_COUNT=0
EMPTY_COUNT=0

for db in "${DATABASES[@]}"; do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Processing: $db${NC}"
    
    # Check if database exists
    DB_EXISTS=$(run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -t -A -c "SELECT 1 FROM pg_database WHERE datname='$db';" 2>/dev/null)
    
    if [ "$DB_EXISTS" != "1" ]; then
        echo -e "${RED}✗ Database $db does not exist${NC}"
        ((FAILED_COUNT++))
        continue
    fi
    
    # Create database-specific directory
    DB_DIR="$OUTPUT_BASE_DIR/$db"
    mkdir -p "$DB_DIR"
    
    # Extract DDL components
    extract_database_objects "$db" "$DB_DIR"
    
    # Create metadata file
    echo "Database: $db" > "$DB_DIR/metadata.txt"
    echo "Extraction Date: $(date)" >> "$DB_DIR/metadata.txt"
    echo "PostgreSQL Version:" >> "$DB_DIR/metadata.txt"
    run_in_container psql -U "$POSTGRES_USER" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$db" -t -A -c "SELECT version();" >> "$DB_DIR/metadata.txt" 2>/dev/null
    
    # Check if database has any objects
    FILE_COUNT=$(find "$DB_DIR" -name "*.sql" -type f | wc -l)
    if [ $FILE_COUNT -eq 0 ]; then
        echo -e "${YELLOW}⚠ Database $db appears to be empty${NC}"
        ((EMPTY_COUNT++))
    else
        echo -e "${GREEN}✓ Successfully extracted $FILE_COUNT DDL files for $db${NC}"
        ((SUCCESS_COUNT++))
    fi
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Summary report
echo -e "${BLUE}Extraction Summary:${NC}"
echo -e "${GREEN}✓ Successful: $SUCCESS_COUNT databases${NC}"
echo -e "${YELLOW}⚠ Empty: $EMPTY_COUNT databases${NC}"
echo -e "${RED}✗ Failed: $FAILED_COUNT databases${NC}"
echo ""

# Create archive
if [ $SUCCESS_COUNT -gt 0 ]; then
    ARCHIVE_NAME="inker_ddls_${DATE}.tar.gz"
    echo -e "${BLUE}Creating archive: $ARCHIVE_NAME${NC}"
    tar -czf "$ARCHIVE_NAME" -C "$(dirname "$OUTPUT_BASE_DIR")" "$(basename "$OUTPUT_BASE_DIR")"
    echo -e "${GREEN}✓ Archive created: $ARCHIVE_NAME${NC}"
    echo ""
fi

# Final report
echo -e "${BLUE}DDL extraction completed!${NC}"
echo -e "Results saved in: ${GREEN}$OUTPUT_BASE_DIR${NC}"
if [ $SUCCESS_COUNT -gt 0 ]; then
    echo -e "Archive available: ${GREEN}$ARCHIVE_NAME${NC}"
fi

# List extracted files
echo ""
echo -e "${BLUE}Extracted files per database:${NC}"
for db in "${DATABASES[@]}"; do
    DB_DIR="$OUTPUT_BASE_DIR/$db"
    if [ -d "$DB_DIR" ]; then
        FILE_COUNT=$(find "$DB_DIR" -name "*.sql" -type f | wc -l)
        if [ $FILE_COUNT -gt 0 ]; then
            echo -e "  ${GREEN}$db: $FILE_COUNT SQL files${NC}"
        fi
    fi
done