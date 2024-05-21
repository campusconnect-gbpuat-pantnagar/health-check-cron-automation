import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FetchHealthCheckService {
  private readonly logger = new Logger(FetchHealthCheckService.name);

  constructor(private readonly httpService: HttpService) {}

  async healthCheck(url: string) {
    try {
      const response = await this.httpService.axiosRef.get(url);
      if (response.status == 200) {
        if (response.data && response.data.includes('HEALTHY')) {
          this.logger.debug(` ${url} : Service is healthy`);
        }
      }
    } catch (error) {
      this.logger.error('Error', error);
      throw error;
    }
  }
}
