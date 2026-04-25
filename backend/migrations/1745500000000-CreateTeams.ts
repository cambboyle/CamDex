import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeams1745500000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        name          VARCHAR(50) NOT NULL,
        game          VARCHAR(50) NOT NULL,
        battle_format VARCHAR(20) NOT NULL DEFAULT 'singles',
        notes         TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id        UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        slot           INT NOT NULL CHECK (slot BETWEEN 1 AND 6),
        form_id        UUID REFERENCES pokemon_forms(id) ON DELETE SET NULL,
        nickname       VARCHAR(12),
        is_shiny       BOOLEAN NOT NULL DEFAULT FALSE,
        held_item      VARCHAR(100),
        ability        VARCHAR(100),
        nature         VARCHAR(20),
        move_1         VARCHAR(100),
        move_2         VARCHAR(100),
        move_3         VARCHAR(100),
        move_4         VARCHAR(100),
        ev_hp          INT NOT NULL DEFAULT 0,
        ev_atk         INT NOT NULL DEFAULT 0,
        ev_def         INT NOT NULL DEFAULT 0,
        ev_spa         INT NOT NULL DEFAULT 0,
        ev_spd         INT NOT NULL DEFAULT 0,
        ev_spe         INT NOT NULL DEFAULT 0,
        iv_hp          INT,
        iv_atk         INT,
        iv_def         INT,
        iv_spa         INT,
        iv_spd         INT,
        iv_spe         INT,
        tera_type      VARCHAR(20),
        mega_stone     VARCHAR(100),
        z_crystal      VARCHAR(100),
        dynamax_level  SMALLINT,
        UNIQUE (team_id, slot)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS team_members`);
    await queryRunner.query(`DROP TABLE IF EXISTS teams`);
  }
}
