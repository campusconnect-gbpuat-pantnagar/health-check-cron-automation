import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckService } from './tasks/health-check-service.task';
import { FetchHealthCheckService } from './services/fetch-health-check.service';
import { FetchUrlDataService } from './services/fetch-url-data.service';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule.registerAsync({
      useFactory: () => ({
        // timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_SERVICE_HOST'),
          // For SSL and TLS connection
          auth: {
            // Account gmail address
            user: configService.get('SMTP_SERVICE_EMAIL'),
            pass: configService.get('SMTP_SERVICE_PASSWORD'),
          },
        },
        template: {
          dir: path.resolve(__dirname, '../templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    HealthCheckService,
    FetchUrlDataService,
    FetchHealthCheckService,
    ConfigService,
  ],
})
export class CronModule {}
