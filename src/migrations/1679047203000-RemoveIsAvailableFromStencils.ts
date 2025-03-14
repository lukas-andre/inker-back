import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIsAvailableFromStencils1679047203000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice de is_available
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_stencils_is_available";
    `);

    // Eliminar la columna is_available
    await queryRunner.query(`
      ALTER TABLE "stencils" DROP COLUMN "is_available";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Volver a añadir la columna is_available
    await queryRunner.query(`
      ALTER TABLE "stencils" ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;
    `);

    // Actualizar is_available basado en status
    await queryRunner.query(`
      UPDATE "stencils" 
      SET "is_available" = (CASE WHEN "status" = 'AVAILABLE' THEN true ELSE false END);
    `);

    // Recrear el índice
    await queryRunner.query(`
      CREATE INDEX "IDX_stencils_is_available" ON "stencils" ("is_available");
    `);
  }
} 