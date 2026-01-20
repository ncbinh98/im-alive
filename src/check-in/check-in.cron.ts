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

  // @Cron(CronExpression.EVERY_DAY_AT_8AM) // Runs daily at 8:00 AM
  // async check3DaysMissedCheckIns() {
  //   this.logger.log('Starting 3-day missed check-ins check for Telegram...');

  //   const now = new Date();
  //   const threeDaysAgo = new Date();
  //   threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  //   try {
  //     // Find users who need alerts
  //     const usersNeedingAlert = await this.userCheckInStatusRepository
  //       .createQueryBuilder('status')
  //       .innerJoinAndSelect('status.user', 'user')
  //       .where('status.alertsEnabled = :enabled', { enabled: true })
  //       .andWhere('status.latestCheckIn < :threeDaysAgo', { threeDaysAgo })
  //       .andWhere(
  //         '(status.nextAlertCheck IS NULL OR status.nextAlertCheck < :now)',
  //         { now },
  //       )
  //       .andWhere('user.telegramId IS NOT NULL')
  //       .getMany();

  //     this.logger.log(
  //       `Found ${usersNeedingAlert.length} users needing Telegram alerts`,
  //     );

  //     for (const status of usersNeedingAlert) {
  //       try {
  //         if (!status.user.telegramId) continue;

  //         await this.telegramBotService.sendMessage({
  //           chatId: status.user.telegramId,
  //           message: `⚠️ WARNING: You haven't checked in for 3 days! Please check in immediately to confirm you are safe.`,
  //         });

  //         await this.telegramBotService.sendCheckInButton(
  //           Number(status.user.telegramId),
  //           'Please click below to check in 👇',
  //         );

  //         this.logger.log(`Telegram alert sent to user: ${status.user.email}`);

  //         // Update nextAlertCheck to avoid spamming (check again in 24 hours)
  //         status.nextAlertCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  //         await this.userCheckInStatusRepository.save(status);
  //       } catch (error) {
  //         this.logger.error(
  //           `Failed to send Telegram alert to user ${status.user.email}:`,
  //           error,
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error('Error in check3DaysMissedCheckIns cron job:', error);
  //   }
  // }

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
          // Increment alerts sent count
          status.totalAlertsSent += 1;
          await this.userCheckInStatusRepository.save(status);

          // Check if emergency threshold is met
          const lastCheckIn = status.latestCheckIn
            ? new Date(status.latestCheckIn)
            : new Date(status.user.createdAt); // Fallback to user creation date if no checkin yet
          // Actually latestCheckIn is nullable, if null maybe we shouldn't act or assume infinite missed?
          // Assuming latestCheckIn is set on account creation or first checkin.
          // If latestCheckIn is null, let's skip emergency logic for now or handle it carefully.

          if (status.latestCheckIn) {
            const missedDurationDays = moment().diff(
              moment(status.latestCheckIn),
              'days',
            );

            if (
              // missedDurationDays >= status.emergencyThresholdDays &&
              status.totalAlertsSent === 3 ||
              status.totalAlertsSent === 5
            ) {
              // If total alerts sent is 3, return

              this.logger.warn(
                `User ${status.user.email} has missed check-ins for ${missedDurationDays} days! Triggering emergency contacts.`,
              );

              if (
                status.user.emergencyContacts &&
                status.user.emergencyContacts.length > 0
              ) {
                for (const contact of status.user.emergencyContacts) {
                  const message =
                    contact.message ??
                    'User has not checked in for 3 days. Please verify their safety.';

                  if (contact.telegramId) {
                    await this.telegramBotService.sendMessage({
                      chatId: contact.telegramId,
                      message: `⚠️THIS IS IMPORTANT MESSAGE FROM <${status.user.firstName} ${status.user.lastName}> TO <${contact.name}>:\n ${message}`,
                    });
                  }

                  if (contact.email) {
                    await this.sendEmail(
                      contact.email,
                      'Emergency Check-in Alert',
                      message,
                    );
                  }
                }
              }
            }
          }

          // Send user alert
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

          this.logger.log(
            `Alert sent to user: ${status.user.email}. Total alerts: ${status.totalAlertsSent}`,
          );
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

  private async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(
      `[Email Stub] To: ${to}, Subject: ${subject}, Body: ${body}`,
    );
    // Implement email sending logic here
  }
}
