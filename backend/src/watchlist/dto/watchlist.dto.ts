import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateWatchlistDto {
  @ApiProperty({ description: '使用者 ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '股票代號', example: '2330' })
  @IsString()
  stockNo: string;

  @ApiProperty({ description: '股票名稱', example: '台積電' })
  @IsString()
  stockName: string;

  @ApiPropertyOptional({ description: '群組名稱', example: '科技業' })
  @IsOptional()
  @IsString()
  groupName?: string;
}

export class UpdateWatchlistGroupDto {
  @ApiProperty({ description: '使用者 ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '群組名稱', example: '銀行' })
  @IsString()
  groupName: string;
}
