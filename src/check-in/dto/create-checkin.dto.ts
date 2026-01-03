import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCheckInDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
