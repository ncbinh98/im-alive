import { IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCheckInConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  @Type(() => Number)
  alertAfterDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  @Type(() => Number)
  emergencyThresholdDays?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  alertsEnabled?: boolean;
}
