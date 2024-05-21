import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchHealthCheckService } from 'src/services/fetch-health-check.service';
import { FetchUrlDataService } from 'src/services/fetch-url-data.service';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(FetchUrlDataService.name);
  constructor(
    private _fetchHealthCheckService: FetchHealthCheckService,
    private _fetchUrlDataService: FetchUrlDataService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async HealthCheckServiceInEVERY_10_SECONDS() {
    try {
      const healthCheckUrls = await this._fetchUrlDataService.getReadmeUrls();
      this.logger.verbose(healthCheckUrls);

      for (const url of healthCheckUrls) {
        await this._fetchHealthCheckService.healthCheck(url);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
