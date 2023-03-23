import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'devices' })
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  IMEINumber: string;

  @Column({ nullable: false })
  deviceName: string;

  @Column({ nullable: false })
  deviceType: string;

  @Column({ nullable: false })
  SIMNumber: string;

  @Column()
  SIMInfo: string;

  @Column()
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
