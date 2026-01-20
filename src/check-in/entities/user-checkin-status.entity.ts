import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_checkin_status')
export class UserCheckInStatus {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.checkInStatus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'latest_check_in', type: 'timestamp', nullable: true })
  latestCheckIn: Date;

  @Column({ name: 'alert_after_days', type: 'int', default: 7 })
  alertAfterDays: number;

  @Column({
    name: 'expired_latest_check_in',
    type: 'timestamp',
    nullable: true,
  })
  expiredLatestCheckIn: Date;

  @Index()
  @Column({ name: 'next_alert_check', type: 'timestamp', nullable: true })
  nextAlertCheck: Date | null;

  @Column({ name: 'alerts_enabled', type: 'boolean', default: true })
  alertsEnabled: boolean;

  @Column({ name: 'total_alerts_sent', type: 'int', default: 0 })
  totalAlertsSent: number;

  @Column({ name: 'emergency_threshold_days', type: 'int', default: 7 })
  emergencyThresholdDays: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
