import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckInService } from './check-in.service';
import { CheckInResponseDto } from './dto/checkin-response.dto';
import { CreateCheckInDto } from './dto/create-checkin.dto';

import { UpdateCheckInConfigDto } from './dto/update-checkin-config.dto';

@Controller('check-in')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  async create(
    @Request() req,
    @Body() createCheckInDto: CreateCheckInDto,
  ): Promise<CheckInResponseDto> {
    const checkIn = await this.checkInService.checkIn(
      req.user,
      createCheckInDto,
    );

    return {
      id: checkIn.id,
      userId: checkIn.userId,
      checkedInAt: checkIn.checkedInAt,
      notes: checkIn.notes,
      message: 'Check-in successful!',
    };
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.checkInService.getUserCheckIns(req.user.id);
  }

  @Get('status')
  async getStatus(@Request() req) {
    return this.checkInService.getCheckInStatus(req.user.id);
  }

  @Get('latest')
  async getLatest(@Request() req) {
    const latest = await this.checkInService.getLatestCheckIn(req.user.id);
    if (!latest) {
      return { message: 'No check-ins found' };
    }
    return latest;
  }

  @Patch('config')
  async updateConfig(
    @Request() req,
    @Body() updateCheckInConfigDto: UpdateCheckInConfigDto,
  ) {
    return this.checkInService.updateCheckInConfig(
      req.user.id,
      updateCheckInConfigDto,
    );
  }

  // For testing purposes only - should be protected in production
    @Post('test-alert')
    async testAlert(@Request() req) {
      // This would trigger a manual check for alerts
      await this.checkInService.forceCheckMissedCheckIns();
      return { message: 'Alert check triggered manually' };
    }
}
