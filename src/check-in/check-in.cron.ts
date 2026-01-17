import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { TelegramBotService } from 'src/telegram-bot/telegram-bot.service';
import { Repository } from 'typeorm';
import { UserCheckInStatus } from './entities/user-checkin-status.entity';

@Injectable()
export class CheckInCron {
  private readonly logger = new Logger(CheckInCron.name);

  constructor(
    @InjectRepository(UserCheckInStatus)
    private userCheckInStatusRepository: Repository<UserCheckInStatus>,
    private telegramBotService: TelegramBotService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Runs daily at 8:00 AM
  async check3DaysMissedCheckIns() {
    this.logger.log('Starting 3-day missed check-ins check for Telegram...');

    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
      // Find users who need alerts
      const usersNeedingAlert = await this.userCheckInStatusRepository
        .createQueryBuilder('status')
        .innerJoinAndSelect('status.user', 'user')
        .where('status.alertsEnabled = :enabled', { enabled: true })
        .andWhere('status.latestCheckIn < :threeDaysAgo', { threeDaysAgo })
        .andWhere(
          '(status.nextAlertCheck IS NULL OR status.nextAlertCheck < :now)',
          { now },
        )
        .andWhere('user.telegramId IS NOT NULL')
        .getMany();

      this.logger.log(
        `Found ${usersNeedingAlert.length} users needing Telegram alerts`,
      );

      for (const status of usersNeedingAlert) {
        try {
          if (!status.user.telegramId) continue;

          await this.telegramBotService.sendMessage({
            chatId: status.user.telegramId,
            message: `⚠️ WARNING: You haven't checked in for 3 days! Please check in immediately to confirm you are safe.`,
          });

          await this.telegramBotService.sendCheckInButton(
            Number(status.user.telegramId),
            'Please click below to check in 👇',
          );

          this.logger.log(`Telegram alert sent to user: ${status.user.email}`);

          // Update nextAlertCheck to avoid spamming (check again in 24 hours)
          status.nextAlertCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          await this.userCheckInStatusRepository.save(status);
        } catch (error) {
          this.logger.error(
            `Failed to send Telegram alert to user ${status.user.email}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in check3DaysMissedCheckIns cron job:', error);
    }
  }

  /* 
    Cron job to check for missed check-ins, based on alertAfterDays
    Runs daily at 9:00 AM
  */
  // @Cron('0 9 * * *')
  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
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
          await this.telegramBotService.sendMessage({
            chatId: status.user.telegramId,
            message: `⚠️ WARNING: You haven't checked in for ${moment(status.latestCheckIn).fromNow()}! Please check in immediately to confirm you are safe.`,
          });

          await this.telegramBotService.sendCheckInButton(
            Number(status.user.telegramId),
            'Please click below to check in 👇',
          );

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
}
