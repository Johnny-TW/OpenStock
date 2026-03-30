import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ description: '使用者 ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '股票代號', example: '2330' })
  @IsString()
  stockNo: string;

  @ApiProperty({ description: '股票名稱', example: '台積電' })
  @IsString()
  stockName: string;

  @ApiProperty({ description: '買入價格', example: 950.0 })
  @IsNumber()
  @Min(0)
  buyPrice: number;

  @ApiProperty({ description: '買入日期', example: '2024-01-15' })
  @IsDateString()
  buyDate: string;

  @ApiProperty({ description: '持有股數', example: 100 })
  @IsNumber()
  @Min(1)
  shares: number;

  @ApiPropertyOptional({ description: '備註', example: '定期定額' })
  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {}
