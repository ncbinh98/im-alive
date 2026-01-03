import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckIn } from './entities/check-in.entity';
import { UserCheckInStatus } from './entities/user-checkin-status.entity';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { User } from '../users/entities/user.entity';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { UserJwtPayload } from 'src/auth/interfaces/user-jwt-payload.interface';
import { UpdateCheckInConfigDto } from './dto/update-checkin-config.dto';

@Injectable()
export class CheckInService {
  private readonly logger = new Logger(CheckInService.name);

  constructor(
    @InjectRepository(CheckIn)
    private checkInRepository: Repository<CheckIn>,
    @InjectRepository(UserCheckInStatus)
    private userCheckInStatusRepository: Repository<UserCheckInStatus>,
    // private emailService: EmailService,
  ) {}

  async checkIn(
    user: UserJwtPayload,
    createCheckInDto: CreateCheckInDto,
  ): Promise<CheckIn> {
    // Create new check-in record
    const checkIn = await this.checkInRepository.save({
      checkedInAt: new Date(),
      notes: createCheckInDto.notes,
      user,
    });

    // Update or create user check-in status
    await this.updateUserCheckInStatus(user, checkIn.checkedInAt);

    return checkIn;
  }

  private async updateUserCheckInStatus(
    user: UserJwtPayload,
    checkInTime: Date,
  ): Promise<void> {
    const userStatus = await this.userCheckInStatusRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    const expiredDate = new Date(checkInTime);
    expiredDate.setDate(
      expiredDate.getDate() + (userStatus?.alertAfterDays || 7),
    );

    if (userStatus) {
      // Update existing status
      userStatus.latestCheckIn = checkInTime;
      userStatus.expiredLatestCheckIn = expiredDate;
      userStatus.nextAlertCheck = null; // Reset alert check since user just checked in
      await this.userCheckInStatusRepository.save(userStatus);
    } else {
      // Create new status
      const newStatus = await this.userCheckInStatusRepository.create({
        userId: user.id,
        user,
        latestCheckIn: checkInTime,
        alertAfterDays: 7,
        expiredLatestCheckIn: expiredDate,
        nextAlertCheck: null,
        alertsEnabled: true,
      });
      await this.userCheckInStatusRepository.save(newStatus);
    }
  }

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return this.checkInRepository.find({
      where: { userId },
      order: { checkedInAt: 'DESC' },
      take: 50, // Limit to recent 50 check-ins
    });
  }

  async getCheckInStatus(userId: string): Promise<UserCheckInStatus> {
    const status = await this.userCheckInStatusRepository.findOne({
      where: { userId },
    });

    if (!status) {
      throw new NotFoundException('Check-in status not found for user');
    }

    return status;
  }

  async updateCheckInConfig(
    userId: string,
    updateDto: UpdateCheckInConfigDto,
  ): Promise<UserCheckInStatus> {
    const status = await this.userCheckInStatusRepository.findOne({
      where: { userId },
    });

    if (!status) {
      throw new NotFoundException('Check-in status not found for user');
    }

    // If alertAfterDays is updated, recalculate expiredLatestCheckIn
    if (updateDto.alertAfterDays !== undefined && status.latestCheckIn) {
      status.alertAfterDays = updateDto.alertAfterDays;
      const expiredDate = new Date(status.latestCheckIn);
      expiredDate.setDate(expiredDate.getDate() + updateDto.alertAfterDays);
      status.expiredLatestCheckIn = expiredDate;
    }

    if (updateDto.alertsEnabled !== undefined) {
      status.alertsEnabled = updateDto.alertsEnabled;
    }

    return this.userCheckInStatusRepository.save(status);
  }

  async getLatestCheckIn(userId: string): Promise<CheckIn | null> {
    const checkIns = await this.checkInRepository.find({
      where: { userId },
      order: { checkedInAt: 'DESC' },
      take: 1,
    });

    return checkIns.length > 0 ? checkIns[0] : null;
  }

  // Cron job to check for missed check-ins
  @Cron('0 9 * * *') // Runs daily at 9:00 AM
  async checkMissedCheckIns() {
    this.logger.log('Starting missed check-ins check...');

    const now = new Date();

    try {
      // Find users who need alerts
      const usersNeedingAlert = await this.userCheckInStatusRepository
        .createQueryBuilder('status')
        .innerJoinAndSelect('status.user', 'user')
        .where('status.alertsEnabled = :enabled', { enabled: true })
        .andWhere('status.expiredLatestCheckIn < :now', { now })
        .andWhere(
          '(status.nextAlertCheck IS NULL OR status.nextAlertCheck < :now)',
          { now },
        )
        .getMany();

      this.logger.log(`Found ${usersNeedingAlert.length} users needing alerts`);

      for (const status of usersNeedingAlert) {
        try {
          //   await this.sendAlertEmail(status.user, status);
          this.logger.log('alert sent', status);

          // Update nextAlertCheck to avoid spamming (check again in 24 hours)
          status.nextAlertCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          await this.userCheckInStatusRepository.save(status);

          this.logger.log(`Alert sent to user: ${status.user.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to send alert to user ${status.user.email}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in checkMissedCheckIns cron job:', error);
    }
  }

  //   private async sendAlertEmail(user: User, status: UserCheckInStatus): Promise<void> {
  //     const daysOverdue = Math.floor(
  //       (new Date().getTime() - status.expiredLatestCheckIn.getTime()) / (1000 * 60 * 60 * 24)
  //     );

  //     const subject = `Reminder: You haven't checked in for ${daysOverdue} day(s)`;
  //     const html = `
  //       <h2>Check-In Reminder</h2>
  //       <p>Hello ${user.email},</p>
  //       <p>You haven't checked in for <strong>${daysOverdue} day(s)</strong>.</p>
  //       <p>Your last check-in was on: ${status.latestCheckIn.toLocaleDateString()}</p>
  //       <p>Please check in soon to avoid further reminders.</p>
  //       <br/>
  //       <p>You can change your alert settings in your account settings.</p>
  //     `;

  //     await this.emailService.sendEmail(user.email, subject, html);
  //   }

  //   // Helper method for testing
  //   async forceCheckMissedCheckIns(): Promise<void> {
  //     this.logger.warn('Force checking missed check-ins');
  //     await this.checkMissedCheckIns();
  //   }
}
