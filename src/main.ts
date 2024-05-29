import { NestFactory } from '@nestjs/core';
import { CronModule } from './cron.module';
import * as path from 'path';
async function bootstrap() {
  console.log(path.resolve(__dirname, '../templates'));
  await NestFactory.createApplicationContext(CronModule);
}

bootstrap();
