


import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from '../../dto/alert.dto';  // Import the DTO
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Alert')
@Controller('alert')
export class AlertController {
    constructor(private readonly alertService: AlertService) {}

    @Post('set')
    @ApiOperation({ summary: 'Set a price alert' })
    @ApiResponse({ status: 201, description: 'Price alert set successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async setPriceAlert(@Body() createAlertDto: CreateAlertDto) {
        await this.alertService.setAlert(createAlertDto.chain, createAlertDto.dollar, createAlertDto.email);
        return { message: 'Price alert set successfully' };
    }

    
}

