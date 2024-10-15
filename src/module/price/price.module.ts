import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';
import { Price } from './price.entity';
import { AlertModule } from '../alert/alert.module'; // Import AlertModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Price]),
    AlertModule, // Add AlertModule here
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
