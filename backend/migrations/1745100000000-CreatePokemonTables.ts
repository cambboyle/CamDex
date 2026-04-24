import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePokemonTables1745100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pokemon_species',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
          { name: 'national_dex_number', type: 'int', isUnique: true, isNullable: false },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'display_name', type: 'varchar', length: '100' },
          { name: 'generation', type: 'int' },
          { name: 'is_legendary', type: 'boolean', default: 'false' },
          { name: 'is_mythical', type: 'boolean', default: 'false' },
          { name: 'is_baby', type: 'boolean', default: 'false' },
          { name: 'color', type: 'varchar', length: '20', isNullable: true },
          { name: 'shape', type: 'varchar', length: '30', isNullable: true },
          { name: 'flavor_text', type: 'text', isNullable: true },
          { name: 'synced_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'pokemon_forms',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
          { name: 'species_id', type: 'uuid', isNullable: false },
          { name: 'form_key', type: 'varchar', length: '100' },
          { name: 'display_name', type: 'varchar', length: '150' },
          { name: 'is_default', type: 'boolean', default: 'true' },
          { name: 'is_battle_only', type: 'boolean', default: 'false' },
          { name: 'is_mega', type: 'boolean', default: 'false' },
          { name: 'is_gmax', type: 'boolean', default: 'false' },
          { name: 'is_regional_variant', type: 'boolean', default: 'false' },
          { name: 'region_variant_name', type: 'varchar', length: '30', isNullable: true },
          { name: 'type1', type: 'varchar', length: '20', isNullable: true },
          { name: 'type2', type: 'varchar', length: '20', isNullable: true },
          { name: 'hp', type: 'int', isNullable: true },
          { name: 'atk', type: 'int', isNullable: true },
          { name: 'def', type: 'int', isNullable: true },
          { name: 'spa', type: 'int', isNullable: true },
          { name: 'spd', type: 'int', isNullable: true },
          { name: 'spe', type: 'int', isNullable: true },
          { name: 'sprite_url', type: 'text', isNullable: true },
          { name: 'sprite_shiny_url', type: 'text', isNullable: true },
          { name: 'sprite_front_url', type: 'text', isNullable: true },
          { name: 'living_dex_order', type: 'int', isNullable: false },
        ],
        uniques: [
          { columnNames: ['species_id', 'form_key'] },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pokemon_forms',
      new TableForeignKey({
        columnNames: ['species_id'],
        referencedTableName: 'pokemon_species',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pokemon_forms', true);
    await queryRunner.dropTable('pokemon_species', true);
  }
}
