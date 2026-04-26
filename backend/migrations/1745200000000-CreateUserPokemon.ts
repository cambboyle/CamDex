import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserPokemon1745200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_pokemon',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'species_id', type: 'uuid', isNullable: false },
          { name: 'form_id', type: 'uuid', isNullable: false },
          { name: 'nickname', type: 'varchar', length: '12', isNullable: true },
          { name: 'is_shiny', type: 'boolean', default: 'false' },
          { name: 'ball', type: 'varchar', length: '20', isNullable: true },
          { name: 'gender', type: 'varchar', length: '1', isNullable: true },
          { name: 'game_of_origin', type: 'varchar', length: '20', isNullable: true },
          { name: 'ot_name', type: 'varchar', length: '8', isNullable: true },
          { name: 'level', type: 'int', isNullable: true },
          { name: 'nature', type: 'varchar', length: '20', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'caught_at', type: 'timestamp', default: 'now()' },
        ],
        uniques: [
          { columnNames: ['user_id', 'form_id', 'is_shiny'] },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_pokemon',
      new TableForeignKey({
        columnNames: ['species_id'],
        referencedTableName: 'pokemon_species',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_pokemon',
      new TableForeignKey({
        columnNames: ['form_id'],
        referencedTableName: 'pokemon_forms',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_pokemon', true);
  }
}
