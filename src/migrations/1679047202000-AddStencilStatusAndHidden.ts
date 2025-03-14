import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStencilStatusAndHidden1679047202000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo enum stencil_status
    await queryRunner.query(`
      CREATE TYPE "stencil_status_enum" AS ENUM ('AVAILABLE', 'SOLD', 'USED');
    `);

    // Añadir las columnas is_featured y order_position con valores predeterminados
    await queryRunner.query(`
      ALTER TABLE "stencils" 
      ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN "order_position" INTEGER NOT NULL DEFAULT 0;
    `);

    // Añadir la columna status y migrar datos desde is_available
    await queryRunner.query(`
      ALTER TABLE "stencils" 
      ADD COLUMN "status" "stencil_status_enum" NOT NULL DEFAULT 'AVAILABLE';
    `);

    // Actualizar el status basado en is_available
    await queryRunner.query(`
      UPDATE "stencils" 
      SET "status" = 'USED' 
      WHERE "is_available" = false;
    `);

    // Añadir la columna is_hidden
    await queryRunner.query(`
      ALTER TABLE "stencils" 
      ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
    `);

    // Crear índices para las nuevas columnas
    await queryRunner.query(`
      CREATE INDEX "idx_stencils_status" ON "stencils" ("status");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_stencils_is_hidden" ON "stencils" ("is_hidden");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_stencils_is_featured" ON "stencils" ("is_featured");
    `);

    // Actualizar la función de búsqueda de texto para incluir los nuevos campos en el tsvector
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS stencils_tsv_update ON stencils;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION stencils_tsv_update_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.tsv := 
          setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'C') ||
          setweight(to_tsvector('spanish', COALESCE(NEW.status::text, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER stencils_tsv_update
      BEFORE INSERT OR UPDATE OF title, description, status
      ON stencils
      FOR EACH ROW
      EXECUTE FUNCTION stencils_tsv_update_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar los índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_stencils_status";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_stencils_is_hidden";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_stencils_is_featured";
    `);

    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE "stencils" 
      DROP COLUMN "is_hidden",
      DROP COLUMN "status",
      DROP COLUMN "is_featured",
      DROP COLUMN "order_position";
    `);

    // Eliminar el tipo enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS "stencil_status_enum";
    `);

    // Restaurar la función original del trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS stencils_tsv_update ON stencils;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION stencils_tsv_update_trigger() RETURNS trigger AS $$
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
      CREATE TRIGGER stencils_tsv_update
      BEFORE INSERT OR UPDATE OF title, description
      ON stencils
      FOR EACH ROW
      EXECUTE FUNCTION stencils_tsv_update_trigger();
    `);
  }
} 