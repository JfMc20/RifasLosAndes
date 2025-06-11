import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateRaffleDto {
  @IsString()
  name: string;

  @IsString()
  prize: string;

  @IsNumber()
  totalTickets: number;

  @IsNumber()
  ticketPrice: number;

  @IsString()
  drawMethod: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRaffleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  prize?: string;

  @IsNumber()
  @IsOptional()
  totalTickets?: number;

  @IsNumber()
  @IsOptional()
  ticketPrice?: number;

  @IsString()
  @IsOptional()
  drawMethod?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
