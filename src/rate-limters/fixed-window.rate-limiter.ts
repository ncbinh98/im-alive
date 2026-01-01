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
const WINDOW_LIMIT = 3;
@Injectable()
export class FixedWindowRatelimiterInterceptor implements NestInterceptor {
  private window = new Map<string, number>();
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    // setInterval(() => console.log('Interval...'), 1000);
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const ip = headers['x-real-ip'];
    const currentWindow = new Date().getMinutes().toString();
    if (this.window.has(currentWindow)) {
      if ((this.window.get(currentWindow) as any) >= WINDOW_LIMIT) {
        throw new HttpException(
          'Rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        this.window.set(
          currentWindow,
          (this.window.get(currentWindow) as any) + 1,
        );
      }
    } else {
      this.window = new Map<string, number>();
      this.window.set(currentWindow, 1);
    }

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
