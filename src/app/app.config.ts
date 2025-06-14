import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {JwtInterceptor} from './jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideNativeDateAdapter(),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
};
