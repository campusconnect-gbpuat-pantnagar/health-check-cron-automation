import { NestFactory } from '@nestjs/core';
import { CronModule } from './cron.module';
async function bootstrap() {
  console.log(process.cwd() + '/templates/');
  await NestFactory.createApplicationContext(CronModule);
}

bootstrap();
