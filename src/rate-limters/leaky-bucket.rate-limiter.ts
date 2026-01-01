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
const OUTFLOW_RATE = 1
@Injectable()
export class LeakyBucketRatelimiterInterceptor implements NestInterceptor {
  private bucket = new Array<Number>();
  constructor() {
    setInterval(() => this.resetBucket(), 10 * 1000);
  }
  /* 
    >Duplicate ResetBucket issue<
    The issue you're experiencing is because interceptors in NestJS are instantiated per module/controller/method depending on how you register them.
    When you use setInterval in the constructor, each instance creates its own timer, leading to multiple resets and potential memory leaks.
    ->Solution: Use a Single Shared Service (Recommended) |Create a separate service to manage the token buckets globally

  */
  //Every 10 seconds bucket or queue, gonna outflow number of item based on OUTFLOW_RATE, FIFO - queue first in first out
  resetBucket() {
    this.bucket.splice(0, OUTFLOW_RATE)
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    // setInterval(() => console.log('Interval...'), 1000);
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const ip = headers['x-real-ip'];
    if (this.bucket.length < BUCKET_SIZE) {
      this.bucket.push(ip);
    }else {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
