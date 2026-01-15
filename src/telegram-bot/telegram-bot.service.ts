import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CheckInService } from 'src/check-in/check-in.service';
import moment from 'moment';
import { CALLBACK_QUERY_EVENT } from './constants';
@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    @Inject(forwardRef(() => CheckInService))
    private checkInService: CheckInService,
  ) {}
  private bot: TelegramBot;

  async onModuleInit() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
      polling: true,
    });

    this.bot.onText(/\/login (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const info = match?.[1].split(' ');
      if (!info) {
        return this.bot.sendMessage(
          chatId,
          '❌ Invalid format.\nUse: /login email password',
        );
      }
      const email = info[0];
      const password = info[1];
      if (!email || !password) {
        return this.bot.sendMessage(
          chatId,
          '❌ Invalid format.\nUse: /login email password',
        );
      }
      await this.linkTelegramChatWithUser(chatId, email, password);
    });

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (query.data === CALLBACK_QUERY_EVENT.CHECK_IN) {
        await this.checkInClient(query.id, chatId);
      }
    });
  }

  async sendMessage(dto: SendMessageDto) {
    this.bot.sendMessage(dto.chatId, dto.message);
  }
  async sendCheckInButton(chatId: number, message: string) {
    await this.bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ Check in',
              callback_data: CALLBACK_QUERY_EVENT.CHECK_IN,
            },
          ],
        ],
      },
    });
  }

  async linkTelegramChatWithUser(
    chatId: number,
    email: string,
    password: string,
  ) {
    try {
      const token = await this.authService.login({
        email,
        password,
      });

      if (!token) {
        return this.bot.sendMessage(chatId, '❌ Invalid email or password');
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return this.bot.sendMessage(chatId, '❌ User not found');
      }

      // Example: link Telegram chat with user
      await this.userService.update(user.id, { telegramId: String(chatId) });

      await this.sendCheckInButton(chatId, '✅ Login successful');
    } catch (err) {
      await this.bot.sendMessage(chatId, '⚠️ Login failed. Try again later.');
    }
  }

  async checkInClient(queryId, chatId) {
    const user = await this.userService.findByTelegramId(String(chatId));
    if (!user) {
      return this.bot.sendMessage(String(chatId), '❌ User not found');
    }
    await this.checkInService.checkIn(
      {
        id: user.id,
        email: user.email,
        username: user.email,
      },
      {
        notes: `Check-in at ${moment().format('YYYY-MM-DD HH:mm:ss')} from Telegram`,
      },
    );
    await this.sendCheckInButton(chatId, '❤️️ Im happy that you still alive!');
    
    await this.bot.answerCallbackQuery(queryId);
  }
}
