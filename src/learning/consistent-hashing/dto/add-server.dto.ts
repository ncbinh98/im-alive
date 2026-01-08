import { IsNumber, IsString } from 'class-validator';

export class AddServerDto {
  @IsString()
  ip: string;

  @IsString()
  name: string;

  @IsNumber()
  weight: number;
}
