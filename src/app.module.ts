import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PriceModule } from './module/price/price.module';
import { PriceController } from './module/price/price.controller';
import { Price } from './module/price/price.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceService } from './module/price/price.service';
import { AlertModule } from './module/alert/alert.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates
        ca: process.env.DB_SSL_CA // Your CA certificate here
      },
    }),
    TypeOrmModule.forFeature([Price]),
    ScheduleModule.forRoot(),  // Make sure to add this line
    PriceModule,
    AlertModule,
  ],
})
export class AppModule {}
