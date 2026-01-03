import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { CheckIn } from './entities/check-in.entity';
import { UserCheckInStatus } from './entities/user-checkin-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckIn, UserCheckInStatus]),
    ScheduleModule.forRoot(),
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
