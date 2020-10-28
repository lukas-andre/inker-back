import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Generated,
} from 'typeorm';

@Entity()
export class Permission {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  controller: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
