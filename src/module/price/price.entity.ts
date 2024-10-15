import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier of the price entry', example: 1 })
  id: number;

  @Column()
  @ApiProperty({ description: 'Symbol of the cryptocurrency (e.g., ETH, MATIC)', example: 'ETH' })
  symbol: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'Price of the cryptocurrency in USD', example: 3400.50 })
  price: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp of the price record', example: '2023-12-01T12:00:00Z' })
  timestamp: Date;
  
}
