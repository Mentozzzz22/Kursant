import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideAnimations} from "@angular/platform-browser/animations";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {DatePipe} from "@angular/common";
import {provideNgxMask} from 'ngx-mask';
import {DialogService} from "primeng/dynamicdialog";
import {CalendarDateFormatter, CalendarModule, CalendarUtils, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CustomDateFormatter} from "./service/custom-date-adapter"; // Импорт адаптера



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(ToastModule),
    importProvidersFrom(CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })),
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter },

    {provide: MessageService, useClass: MessageService},
    {provide: DialogService, useClass: DialogService},
    {provide: ConfirmationService, useClass: ConfirmationService},
    {provide:DatePipe, useClass:DatePipe},
    provideNgxMask(),
    {provide: CalendarUtils, useClass: CalendarUtils}
  ]};
