import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Box } from './box.entity';
import { UserPokemon } from '../../collection/entities/user-pokemon.entity';

@Entity('box_slots')
@Unique(['boxId', 'slotPosition'])
export class BoxSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Box, (box) => box.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'box_id' })
  box: Box;

  @Column({ type: 'uuid', name: 'box_id' })
  boxId: string;

  @Column({ type: 'int', name: 'slot_position' })
  slotPosition: number;

  @OneToOne(() => UserPokemon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_pokemon_id' })
  pokemon: UserPokemon | null;

  @Column({
    type: 'uuid',
    nullable: true,
    unique: true,
    name: 'user_pokemon_id',
  })
  userPokemonId: string | null;
}
