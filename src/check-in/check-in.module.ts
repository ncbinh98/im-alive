import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckInService } from './check-in.service';
import { CheckInCron } from './check-in.cron';
import { CheckInController } from './check-in.controller';
import { CheckIn } from './entities/check-in.entity';
import { UserCheckInStatus } from './entities/user-checkin-status.entity';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckIn, UserCheckInStatus]),
    ScheduleModule.forRoot(),
    forwardRef(() => TelegramBotModule),
  ],
  controllers: [CheckInController],
  providers: [CheckInService, CheckInCron],
  exports: [CheckInService],
})
export class CheckInModule {}
