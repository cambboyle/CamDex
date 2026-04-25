import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlavorTexts1745400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE pokemon_species
      ADD COLUMN IF NOT EXISTS flavor_texts JSONB NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE pokemon_species DROP COLUMN IF EXISTS flavor_texts;
    `);
  }
}
