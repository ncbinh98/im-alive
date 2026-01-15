import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  chatId: number | string;

  @IsString()
  message: string;
}
