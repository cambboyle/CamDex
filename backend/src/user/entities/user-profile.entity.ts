import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  id: string

  @Column({ nullable: true, length: 50 })
  username: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
