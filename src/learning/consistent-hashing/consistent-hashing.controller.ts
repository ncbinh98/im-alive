import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AddServerDto } from './dto/add-server.dto';
import { ConsistentHashingService } from './consistent-hashing.service';
import { DeleteServerDto } from './dto/delete-server.dto';

@Controller('learning/consistent-hashing')
export class ConsistentHashingController {
  constructor(
    private readonly consistentHashingService: ConsistentHashingService,
  ) {}

  @Post()
  addServer(@Body() dto: AddServerDto) {
    return this.consistentHashingService.addServer(dto);
  }

  @Get()
  getServerByKey(@Query('key') key: string) {
    return this.consistentHashingService.getServerByKey(key);
  }

  @Delete()
  removeServer(@Body() dto: DeleteServerDto) {
    return this.consistentHashingService.removeServer(dto);
  }
}
