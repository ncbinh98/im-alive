import { Module } from '@nestjs/common';
import { ConsistentHashingController } from './consistent-hashing.controller';
import { ConsistentHashingService } from './consistent-hashing.service';

@Module({
  controllers: [ConsistentHashingController],
  providers: [ConsistentHashingService],
})
export class ConsistentHashingModule {}
