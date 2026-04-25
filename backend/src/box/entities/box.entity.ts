import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BoxSlot } from './box-slot.entity';

@Entity('boxes')
@Unique(['userId', 'position'])
export class Box {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wallpaper: string | null;

  @OneToMany(() => BoxSlot, (slot) => slot.box, { cascade: true })
  slots: BoxSlot[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
