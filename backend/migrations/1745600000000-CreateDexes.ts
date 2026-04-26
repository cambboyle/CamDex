import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDexes1745600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS dexes (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        name       VARCHAR(60) NOT NULL,
        game       VARCHAR(50) NOT NULL DEFAULT 'home',
        dex_type   VARCHAR(30) NOT NULL DEFAULT 'living-form',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_dexes_user_id ON dexes(user_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS dex_entries (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dex_id     UUID NOT NULL REFERENCES dexes(id) ON DELETE CASCADE,
        form_id    UUID NOT NULL REFERENCES pokemon_forms(id) ON DELETE CASCADE,
        caught_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (dex_id, form_id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_dex_entries_dex_id ON dex_entries(dex_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS dex_entries`);
    await queryRunner.query(`DROP TABLE IF EXISTS dexes`);
  }
}
