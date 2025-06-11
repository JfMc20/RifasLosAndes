import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { TicketStatus } from '../schemas/ticket.schema';

export class CreateTicketDto {
  @IsString()
  number: string;

  @IsMongoId()
  raffle: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  buyerName?: string;

  @IsString()
  @IsOptional()
  buyerEmail?: string;

  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTicketDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  buyerName?: string;

  @IsString()
  @IsOptional()
  buyerEmail?: string;

  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMultipleTicketsStatusDto {
  @IsString({ each: true })
  ticketNumbers: string[];

  @IsEnum(TicketStatus)
  status: TicketStatus;
}
