import { Global, Module } from '@nestjs/common';
import { TokenBucketRatelimiterInterceptor } from './token-bucket.rate-limiter';

@Module({
  providers: [TokenBucketRatelimiterInterceptor],
  exports: [TokenBucketRatelimiterInterceptor],
})
export class RateLimitersModule {}
