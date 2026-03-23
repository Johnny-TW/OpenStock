import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
}
