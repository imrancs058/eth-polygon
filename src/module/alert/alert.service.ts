import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alart.entity';
import { CreateAlertDto } from '../../dto/alert.dto';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';
import Moralis from 'moralis';
import token from '../../contants/token';
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  // Setup nodemailer transporter
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async setAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<void> {
    const alert = this.alertRepository.create({ chain, targetPrice, email });
    await this.alertRepository.save(alert);
  }

  @Cron('*/1 * * * *') // Runs every minute
  async checkAlerts() {
    const alerts = await this.alertRepository.find();
    // Check For Alert
    for (const alert of alerts) {
      const currentPrice = await this.getCurrentPrice();
      console.log(Number(alert.targetPrice), alert.targetPrice)
      if (currentPrice >= Number(alert.targetPrice)) {
        await this.sendEmail(alert.email, alert.chain, currentPrice);
      }
    }
  }

  private async sendEmail(to: string, chain: string, price: number) {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to,
      subject: `Price Alert: ${chain} has crossed your target price`,
      text: `The current price of ${chain} is $${price}.`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  private async getCurrentPrice(): Promise<number> {
    try {
      const options = { address:  token[0]?.address, chain:  token[0]?.chain };
      const priceResponse: any = await Moralis.EvmApi.token.getTokenPrice(
        options,
      );
      const priceInUSD: string = priceResponse?.jsonResponse?.nativePrice.value;
      return Number(priceInUSD);
    } catch (error) {
      return 0; 
    }
  }
}
