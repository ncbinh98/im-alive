import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const payload = { username: dto.username };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getMe(){
    return { username: 'test' };
  }
}
