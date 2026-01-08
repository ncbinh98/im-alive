import { Module } from '@nestjs/common';
import { ConsistentHashingModule } from './consistent-hashing/consistent-hashing.module';

@Module({
  imports: [ConsistentHashingModule],
})
export class LearningModule {}
