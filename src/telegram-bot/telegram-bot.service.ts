import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { SendMessageDto } from './dto/send-message.dto';
@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor() {}
  private bot: TelegramBot;

  async onModuleInit() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
      polling: true,
    });
    this.bot.on('message', (msg) => {
      console.log(msg);
    });
  }

  async sendMessage(dto: SendMessageDto) {
    this.bot.sendMessage(dto.chatId, dto.message);
  }
}
