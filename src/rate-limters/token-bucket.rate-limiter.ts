import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
const BUCKET_SIZE = 3;
const REFILL_INTERVAL = 10 * 1000;
@Injectable()
export class TokenBucketRatelimiterInterceptor implements NestInterceptor {
  private bucket = new Map<string, number>();
  constructor() {
    setInterval(() => this.resetBucket(), REFILL_INTERVAL);
  }
  /* 
    >Duplicate ResetBucket issue<
    The issue you're experiencing is because interceptors in NestJS are instantiated per module/controller/method depending on how you register them.
    When you use setInterval in the constructor, each instance creates its own timer, leading to multiple resets and potential memory leaks.

    ->Solution: Use a Single Shared Service (Recommended) |Create a separate service to manage the token buckets globally

  */
  resetBucket() {
    this.bucket = new Map<string, number>();
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    // setInterval(() => console.log('Interval...'), 1000);
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const ip = headers['x-real-ip'];
    if (!this.bucket.has(ip)) {
      this.bucket.set(ip, BUCKET_SIZE);
    }
    if (this.bucket.get(ip) === 0) {
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      this.bucket.set(ip, (this.bucket.get(ip) as any) - 1);
    }
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
