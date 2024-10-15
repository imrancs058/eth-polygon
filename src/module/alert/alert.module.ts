import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alart.entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule {}
