import { Body, Controller, Get, Post } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}

  @Post()
  sendMessage(@Body() dto: SendMessageDto) {
    return this.telegramBotService.sendMessage(dto);
  }
}
