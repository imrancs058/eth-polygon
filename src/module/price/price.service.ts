// src/price/price.service.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Moralis from 'moralis';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { Price } from './price.entity';
import * as nodemailer from 'nodemailer';
import { formatUnits } from 'ethers';
import tokens from '../../contants/token';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    private readonly alertService: AlertService,
  ) {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  // Set up the nodemailer transporter for sending emails
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Fetch token prices every 5 minutes for Ethereum and Polygon
  @Cron('*/5 * * * *')
  async fetchTokenPrice() {
    for (const token of tokens) {
      const options = { address: token.address, chain: token.chain };
      try {
        const priceResponse: any =
          await Moralis.EvmApi.token.getTokenPrice(options);
        const priceInUSD: string = formatUnits(
          priceResponse?.jsonResponse?.nativePrice.value,
          priceResponse?.jsonResponse?.nativePrice.decimals,
        );
        // Save the price in the database
        await this.priceRepository.save({
          symbol: token.symbol,
          price: Number(priceInUSD), // Convert String to number
          timestamp: new Date(),
        });

        // Check for a 3% price increase in the last hour
        await this.checkPriceAlert(token.symbol, Number(priceInUSD));
      } catch (error) {
        if (error?.code === 'C0006') {
          console.error(
            `No liquidity pools found for ${token.symbol} address: ${token.address}`,
          );
        } else {
          console.error(`Error fetching ${token.symbol} price:`, error);
        }
      }
    }
  }

  // Check if the price increased by 3% in the last hour and send email
  async checkPriceAlert(symbol: string, currentPrice: number) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const priceOneHourAgo = await this.priceRepository.findOne({
      where: {
        symbol,
        timestamp: LessThanOrEqual(oneHourAgo),
      },
      order: { timestamp: 'DESC' },
    });

    if (priceOneHourAgo) {
      const priceChange =
        ((currentPrice - priceOneHourAgo.price) / priceOneHourAgo.price) * 100;
      if (priceChange > 3) {
        await this.sendEmail(symbol, currentPrice);
      }
    }
  }

  // Send Email notification
  async sendEmail(symbol: string, price: number) {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_RECEIVER,
      subject: `${symbol} Price Alert: 3% Increase`,
      text: `The price of ${symbol} has increased by more than 3% in the last hour. Current price: $${price}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Price alert email sent.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  // Get Price for last hours
  async getPricesLast24Hours() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return this.priceRepository.find({
        where: { timestamp: MoreThan(oneDayAgo) },
        order: { timestamp: 'DESC' },
      });
      console.log('Price alert email sent.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async getSwapRate(ethAmount: number): Promise<{ btcAmount: number; totalFeeEth: number; totalFeeUSD: number }> {
    if (ethAmount <= 0) {
      throw new Error('Invalid input: ethAmount must be a positive number');
    }
  
    try {
      // Fetch current ETH price in USD
      const ethToUsdResponse: any = await Moralis.EvmApi.token.getTokenPrice({
        address: tokens[0].address, // Address for ETH
        chain: tokens[0].chain,
      });
  
      const ethToUsdRate = parseFloat(formatUnits(ethToUsdResponse.jsonResponse.nativePrice.value, ethToUsdResponse.jsonResponse.nativePrice.decimals));
  
      // Fetch current BTC price in USD
      const btcToUsdResponse: any = await Moralis.EvmApi.token.getTokenPrice({
        address: '0x2260fac5e5542a773aa44fbcfed6b7358218fba8', // Address for WBTC (Wrapped Bitcoin)
        chain: '0x1',
      });
  
      const btcToUsdRate = parseFloat(formatUnits(btcToUsdResponse.jsonResponse.nativePrice.value, btcToUsdResponse.jsonResponse.nativePrice.decimals));
  
      // Calculate ETH to BTC rate
      const ethToBtcRate = ethToUsdRate / btcToUsdRate;
  
      const feePercentage = 0.03; // 3% fee
  
      // Calculate BTC amount
      const btcAmount = ethAmount * ethToBtcRate;
  
      // Calculate total fee in ETH
      const totalFeeEth = ethAmount * feePercentage;
  
      // Calculate total fee in USD
      const totalFeeUSD = totalFeeEth * ethToUsdRate;
  
      return {
        btcAmount,
        totalFeeEth,
        totalFeeUSD,
      };
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new Error('Failed to fetch prices');
    }
  }

}
