import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchHealthCheckService } from 'src/services/fetch-health-check.service';
import { FetchUrlDataService } from 'src/services/fetch-url-data.service';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(FetchUrlDataService.name);
  private healthStatus: Record<
    string,
    {
      serviceName: string;
      healthcheckUrl: string;
      githubRepoUrl: string;
      deploymentUrl: string;
      lastDownTime: Date | null;
    }
  > = {};
  constructor(
    private _fetchHealthCheckService: FetchHealthCheckService,
    private _fetchUrlDataService: FetchUrlDataService,
    private _configService: ConfigService,
    private _mailService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async HealthCheckServiceInEVERY_10_SECONDS() {
    try {
      const healthCheckUrls = await this._fetchUrlDataService.getServiceUrls();
      // this.logger.verbose(healthCheckUrls);
      for (const {
        serviceName,
        healthcheckUrl,
        githubRepoUrl,
        deploymentUrl,
      } of healthCheckUrls) {
        const isHealthy = await this._fetchHealthCheckService.healthCheck({
          serviceName,
          healthcheckUrl,
          githubRepoUrl,
          deploymentUrl,
        });
        this.updateHealthStatus(
          serviceName,
          healthcheckUrl,
          githubRepoUrl,
          deploymentUrl,
          isHealthy,
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  private updateHealthStatus(
    serviceName: string,
    healthcheckUrl: string,
    githubRepoUrl: string,
    deploymentUrl: string,
    isHealthy: boolean,
  ) {
    this.logger.warn(this.healthStatus);
    if (!this.healthStatus[serviceName]) {
      this.healthStatus[serviceName] = {
        serviceName,
        githubRepoUrl,
        healthcheckUrl,
        deploymentUrl,
        lastDownTime: null,
      };
    }

    if (isHealthy) {
      this.healthStatus[serviceName].lastDownTime = null;
    } else if (!this.healthStatus[serviceName].lastDownTime) {
      this.healthStatus[serviceName].lastDownTime = new Date();
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkAndSendAlerts() {
    const now = new Date();

    for (const [serviceName, status] of Object.entries(this.healthStatus)) {
      if (status.lastDownTime) {
        const downDuration = now.getTime() - status.lastDownTime.getTime();
        // const tenMinutes = 10 * 1000; // 10 seconds in milliseconds
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

        if (downDuration >= tenMinutes) {
          this.logger.log(
            `The service ${serviceName} (${status.healthcheckUrl}) has been down for more than 10 minutes.`,
          );
          const usersDetails = await this._fetchUrlDataService.getUserDetails();
          for (const user of usersDetails) {
            const context = {
              imageUrl:
                'https://ucarecdn.com/e2b3a2df-2f63-4deb-a5e3-04eacb9de2db/cc_logo_horizontal.png',
              name: user?.name.split(' ')[0],
              serviceName: serviceName,
              githubRepoUrl: status.githubRepoUrl,
              deploymentUrl: status.deploymentUrl,
            };
            this.logger.debug(`Starting the Mail service for ${user.email}`);
            await this._mailService.sendMail({
              to: user.email,
              from: `Newrelic CampusConnect ${this._configService.get<string>('SMTP_SERVICE_EMAIL')}`,
              subject: `Emergency: Service Failure Alert ⚠️`,
              template: 'service-alert',
              context,
            });
            this.logger.debug('Mail sent successfully', user.email);
          }
          this.healthStatus[serviceName].lastDownTime = null;
        }
      }
    }
  }
}
