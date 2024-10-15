import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';
import { MoreThan, Repository } from 'typeorm';
import { Price } from './price.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('price') // This defines the base route `/price`
@ApiTags('Price') // Swagger tag
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('history/24') // This defines the `/price/history` route
  @ApiOperation({ summary: 'Get price history for the last 24 hours' })
  @ApiResponse({
    status: 200,
    description: 'Price history retrieved successfully',
    type: [Price],
  })
  getPricesLast24Hours() {
    return this.priceService.getPricesLast24Hours();
  }

  @Get('swap-rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    return this.priceService.getSwapRate(ethAmount);
  }
}
