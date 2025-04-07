import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkSourceColumn1679047201000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo enum work_source
    await queryRunner.query(`
      CREATE TYPE "work_source_enum" AS ENUM ('APP', 'EXTERNAL');
    `);

    // Agregar la columna source con valor predeterminado 'EXTERNAL'
    await queryRunner.query(`
      ALTER TABLE "works" 
      ADD COLUMN "source" "work_source_enum" NOT NULL DEFAULT 'EXTERNAL';
    `);

    // Crear índice para la columna source
    await queryRunner.query(`
      CREATE INDEX "idx_works_source" ON "works" ("source");
    `);

    // Actualizar la función de búsqueda de texto para incluir el nuevo campo en el tsvector
    // Suponiendo que ya existe una función similar para actualizar el campo tsv
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS works_tsv_update ON works;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION works_tsv_update_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.tsv := 
          setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.source::text, '')), 'C') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.source::text, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER works_tsv_update
      BEFORE INSERT OR UPDATE OF title, description, source
      ON works
      FOR EACH ROW
      EXECUTE FUNCTION works_tsv_update_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_works_source";
    `);

    // Eliminar la columna
    await queryRunner.query(`
      ALTER TABLE "works" DROP COLUMN "source";
    `);

    // Eliminar el tipo enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS "work_source_enum";
    `);

    // Restaurar la función original del trigger (asumiendo que existía previamente)
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS works_tsv_update ON works;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION works_tsv_update_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.tsv := 
          setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER works_tsv_update
      BEFORE INSERT OR UPDATE OF title, description
      ON works
      FOR EACH ROW
      EXECUTE FUNCTION works_tsv_update_trigger();
    `);
  }
} 