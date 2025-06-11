import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInfoTickerDto {
  @IsNotEmpty()
  @IsString()
  ticketPrice: string;

  @IsNotEmpty()
  @IsString()
  drawDate: string;

  @IsNotEmpty()
  @IsString()
  announcementChannel: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

export class UpdateInfoTickerDto extends CreateInfoTickerDto {}
