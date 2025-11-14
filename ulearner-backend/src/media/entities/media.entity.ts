import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'media' })
export class MediaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  filename!: string;

  @Column({ name: 'mime_type', length: 120 })
  mimeType!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ name: 'storage_path', nullable: true })
  storagePath?: string;

  @Column({ type: 'bytea', nullable: true })
  data!: Buffer | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploader_id' })
  uploader?: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
