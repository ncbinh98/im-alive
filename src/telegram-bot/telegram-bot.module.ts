import { Module, forwardRef } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CheckInModule } from 'src/check-in/check-in.module';

@Module({
  imports: [AuthModule, UsersModule, forwardRef(() => CheckInModule)],
  controllers: [TelegramBotController],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
