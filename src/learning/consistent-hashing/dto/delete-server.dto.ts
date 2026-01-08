import { IsNumber, IsString } from 'class-validator';

export class DeleteServerDto {
  @IsString()
  ip: string;

  @IsString()
  name: string;
}
