import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsHiddenToWorks1679047204000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Añadir la columna is_hidden a la tabla works
    await queryRunner.query(`
      ALTER TABLE "works" 
      ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
    `);

    // Crear índice para is_hidden
    await queryRunner.query(`
      CREATE INDEX "idx_works_is_hidden" ON "works" ("is_hidden");
    `);

    // Actualizar la función de búsqueda de texto para incluir el campo isHidden
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
      DROP INDEX IF EXISTS "idx_works_is_hidden";
    `);

    // Eliminar la columna is_hidden
    await queryRunner.query(`
      ALTER TABLE "works" DROP COLUMN "is_hidden";
    `);

    // Restaurar la función original del trigger
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
} 