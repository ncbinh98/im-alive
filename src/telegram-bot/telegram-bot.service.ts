import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
      polling: true,
    });
    bot.on('message', (msg) => {
      console.log(msg);
    });
  }
}
