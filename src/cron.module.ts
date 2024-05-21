import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckService } from './tasks/health-check-service.task';
import { FetchHealthCheckService } from './services/fetch-health-check.service';
import { FetchUrlDataService } from './services/fetch-url-data.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.registerAsync({
      useFactory: () => ({
        // timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    ConfigModule,
  ],
  controllers: [],
  providers: [HealthCheckService, FetchUrlDataService, FetchHealthCheckService],
})
export class CronModule {}
