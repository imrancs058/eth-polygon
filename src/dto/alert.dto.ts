import { ApiProperty } from '@nestjs/swagger';
export class CreateAlertDto {
    @ApiProperty({ description: 'The blockchain chain to monitor (e.g., ETH, MATIC)' , default:"ETH"})
    chain: string;

    @ApiProperty({ description: 'The target price in dollars for the alert' })
    dollar: number;

    @ApiProperty({ description: 'The email address to send alerts to', default:'test.io@gmail.com'})
    email: string;
}
