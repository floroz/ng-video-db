import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from 'src/environments/environment';

@Injectable()
export class HttpHeadersInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(env.BASE_URL)) {
      return next.handle(request);
    }

    const clone = request.clone({
      setParams: {
        key: env.API_KEY,
      },
    });

    return next.handle(clone);
  }
}
