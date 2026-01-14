import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  chatId: number;

  @IsString()
  message: string;
}
