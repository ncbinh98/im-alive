import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/auth.decorator';
import { TokenBucketRatelimiterInterceptor } from 'src/rate-limters/token-bucket.rate-limiter';
import { LeakyBucketRatelimiterInterceptor } from 'src/rate-limters/leaky-bucket.rate-limiter';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Post('/login')
  // @UseInterceptors(TokenBucketRatelimiterInterceptor)
  @UseInterceptors(LeakyBucketRatelimiterInterceptor)
  login(@Body() dto: LoginDto) {
    return this.authSvc.login(dto);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req) {
    const user = req.user;
    return this.authSvc.getMe(user);
  }
}
