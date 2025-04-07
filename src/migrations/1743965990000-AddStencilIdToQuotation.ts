import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStencilIdToQuotation1743965990000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quotation" 
      ADD COLUMN "stencil_id" integer NULL,
      ADD CONSTRAINT "fk_quotation_stencil" 
      FOREIGN KEY ("stencil_id") 
      REFERENCES "stencils"("id") 
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quotation" 
      DROP CONSTRAINT "fk_quotation_stencil",
      DROP COLUMN "stencil_id";
    `);
  }
} 