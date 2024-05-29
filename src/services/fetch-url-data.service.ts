import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface ServiceUrlInterface {
  serviceName: string;
  healthcheckUrl: string;
  githubRepoUrl: string;
  deploymentUrl: string;
}
interface UserDetailsInterface {
  name: string;
  email: string;
}
@Injectable()
export class FetchUrlDataService {
  private readonly logger = new Logger(FetchUrlDataService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly _configService: ConfigService,
  ) {}

  async getServiceUrls(): Promise<ServiceUrlInterface[]> {
    const response: AxiosResponse<string> = await firstValueFrom(
      this.httpService.get(this._configService.get('URLS_JSON'), {
        responseType: 'json',
      }),
    );

    return response.data as unknown as ServiceUrlInterface[];
  }
  async getUserDetails(): Promise<UserDetailsInterface[]> {
    const response: AxiosResponse<string> = await firstValueFrom(
      this.httpService.get(this._configService.get('EMAIL_JSON'), {
        responseType: 'json',
      }),
    );

    return response.data as unknown as UserDetailsInterface[];
  }
}
