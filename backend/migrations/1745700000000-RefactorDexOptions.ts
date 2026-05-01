import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces the `dex_type` VARCHAR column with three independent booleans:
 *   is_shiny             — track shiny sprites
 *   include_forms        — include alternate/regional/mega forms (not species-only)
 *   include_cosmetic_forms — include purely visual variants (Unown letters, Vivillon patterns, etc.)
 *
 * Also adds `is_cosmetic_only` to pokemon_forms, auto-detected by comparing
 * each non-default form's type + stats against its species' default form.
 * Forms that are identical in type and all six stats are purely cosmetic.
 */
export class RefactorDexOptions1745700000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // ── pokemon_forms: add is_cosmetic_only ────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE pokemon_forms
        ADD COLUMN IF NOT EXISTS is_cosmetic_only BOOLEAN NOT NULL DEFAULT false
    `);

    // Mark cosmetic forms: non-default, non-regional, non-mega, non-gmax,
    // non-battle-only forms whose type and all stats match the default form.
    await queryRunner.query(`
      UPDATE pokemon_forms pf
      SET is_cosmetic_only = TRUE
      WHERE pf.is_default        = FALSE
        AND pf.is_regional_variant = FALSE
        AND pf.is_mega           = FALSE
        AND pf.is_gmax           = FALSE
        AND pf.is_battle_only    = FALSE
        AND EXISTS (
          SELECT 1 FROM pokemon_forms def
          WHERE def.species_id = pf.species_id
            AND def.is_default = TRUE
            AND def.type1 IS NOT DISTINCT FROM pf.type1
            AND def.type2 IS NOT DISTINCT FROM pf.type2
            AND def.hp  IS NOT DISTINCT FROM pf.hp
            AND def.atk IS NOT DISTINCT FROM pf.atk
            AND def.def IS NOT DISTINCT FROM pf.def
            AND def.spa IS NOT DISTINCT FROM pf.spa
            AND def.spd IS NOT DISTINCT FROM pf.spd
            AND def.spe IS NOT DISTINCT FROM pf.spe
        )
    `);

    // ── dexes: add new boolean columns ────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE dexes
        ADD COLUMN IF NOT EXISTS is_shiny               BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS include_forms          BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS include_cosmetic_forms BOOLEAN NOT NULL DEFAULT false
    `);

    // Backfill from dex_type
    await queryRunner.query(`
      UPDATE dexes SET
        is_shiny      = dex_type IN ('shiny-form', 'shiny-species'),
        include_forms = dex_type IN ('living-form', 'shiny-form')
    `);

    // Drop the old column
    await queryRunner.query(`
      ALTER TABLE dexes DROP COLUMN IF EXISTS dex_type
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Restore dex_type from booleans
    await queryRunner.query(`
      ALTER TABLE dexes
        ADD COLUMN IF NOT EXISTS dex_type VARCHAR(30) NOT NULL DEFAULT 'living-form'
    `);
    await queryRunner.query(`
      UPDATE dexes SET dex_type =
        CASE
          WHEN is_shiny AND include_forms THEN 'shiny-form'
          WHEN is_shiny                   THEN 'shiny-species'
          WHEN include_forms              THEN 'living-form'
          ELSE 'species'
        END
    `);
    await queryRunner.query(`
      ALTER TABLE dexes
        DROP COLUMN IF EXISTS is_shiny,
        DROP COLUMN IF EXISTS include_forms,
        DROP COLUMN IF EXISTS include_cosmetic_forms
    `);

    // Remove is_cosmetic_only
    await queryRunner.query(`
      ALTER TABLE pokemon_forms DROP COLUMN IF EXISTS is_cosmetic_only
    `);
  }
}
