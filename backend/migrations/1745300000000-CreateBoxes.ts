import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBoxes1745300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS boxes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        name VARCHAR(20) NOT NULL,
        position INT NOT NULL,
        wallpaper VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, position)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS box_slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
        slot_position INT NOT NULL CHECK (slot_position >= 0 AND slot_position <= 29),
        user_pokemon_id UUID REFERENCES user_pokemon(id) ON DELETE SET NULL,
        UNIQUE(box_id, slot_position),
        UNIQUE(user_pokemon_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_box_slots_box_id ON box_slots(box_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_boxes_user_id ON boxes(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS box_slots;`);
    await queryRunner.query(`DROP TABLE IF EXISTS boxes;`);
  }
}
