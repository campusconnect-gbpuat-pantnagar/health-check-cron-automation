import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ServiceUrlInterface } from './fetch-url-data.service';

@Injectable()
export class FetchHealthCheckService {
  private readonly logger = new Logger(FetchHealthCheckService.name);

  constructor(private readonly httpService: HttpService) {}

  async healthCheck({
    healthcheckUrl,
    serviceName,
    githubRepoUrl,
    deploymentUrl,
  }: ServiceUrlInterface) {
    try {
      const response = await this.httpService.axiosRef.get(healthcheckUrl);
      if (
        response.status !== 200 ||
        !response.data ||
        !response.data.includes('HEALTHY')
      ) {
        this.logger.debug(
          ` [${serviceName}]  ${healthcheckUrl} : Service is Unavailable 💥 `,
        );
        return false;
      }
      this.logger.debug(
        ` [${serviceName}]  ${healthcheckUrl} : Service is Available 🚀`,
      );
      return true;
    } catch (error) {
      this.handleHttpError(error, {
        serviceName,
        healthcheckUrl,
        githubRepoUrl,
        deploymentUrl,
      });
      return false;
    }
  }

  private handleHttpError(error: AxiosError, data: ServiceUrlInterface) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      this.logger.error(
        `Error Response from [${data.serviceName}]  ${data.healthcheckUrl}`,
        {
          statusCode: error.response.status,
          data: error.response.data,
        },
      );
      this.logger.debug(
        ` [${data.serviceName}]  ${data.healthcheckUrl} : Service is Unavailable 💥 `,
      );
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error(
        `No Response from [${data.serviceName}]  ${data.healthcheckUrl}`,
        error.request,
      );
      this.logger.debug(
        ` [${data.serviceName}]  ${data.healthcheckUrl} : Service is Unavailable 💥 `,
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      this.logger.error(
        `Error in request setup for [${data.serviceName}]  ${data.healthcheckUrl}`,
        error.message,
      );
      this.logger.debug(
        ` [${data.serviceName}]  ${data.healthcheckUrl} : Service is Unavailable 💥 `,
      );
    }
  }
}
