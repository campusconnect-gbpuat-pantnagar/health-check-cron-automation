import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class FetchUrlDataService {
  private readonly logger = new Logger(FetchUrlDataService.name);

  constructor(private readonly httpService: HttpService) {}

  async getReadmeUrls(): Promise<string[]> {
    const url =
      'https://github.com/campusconnect-gbpuat-pantnagar/healthcheck-urls/blob/main/README.md';
    const response: AxiosResponse<string> = await firstValueFrom(
      this.httpService.get(url),
    );
    const readmeContent = response.data;

    // Extract the array of URLs from the README content
    const arrayPattern = /const healthcheckUrl=\[(.*?)\]/s;
    const match = arrayPattern.exec(readmeContent);

    if (!match || match.length < 1) {
      return [];
    }
    // Extract individual URLs from the matched array string
    const urlsString = match[1];
    const urlPattern = /(https?:\/\/[^\s,]+)/g;
    const urls = urlsString
      .match(urlPattern)
      .map((url) => url.replace(/\\n/g, '').trim());

    return urls || [];
  }
}
