import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TicketService, PaginatedTicketResponse } from './ticket.service'; // Importar PaginatedTicketResponse
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TicketStatus } from '../../common/schemas/ticket.schema';
import { UpdateMultipleTicketsStatusDto } from '../../common/dto/ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // Public endpoints
  @Get('raffle/:raffleId/status')
  async getTicketStatusSummary(@Param('raffleId') raffleId: string) {
    return this.ticketService.getTicketStatusSummary(raffleId);
  }

  @Get('raffle/:raffleId/available')
  async getAvailableTickets(@Param('raffleId') raffleId: string) {
    return this.ticketService.findTicketsByStatus(raffleId, TicketStatus.AVAILABLE);
  }

  @Post('raffle/:raffleId/reserve')
  async reserveTickets(
    @Param('raffleId') raffleId: string,
    @Body() body: { ticketNumbers: string[] }
  ) {
    return this.ticketService.reserveTickets(raffleId, body.ticketNumbers);
  }

  // Protected endpoints (Admin only)
  @UseGuards(JwtAuthGuard)
  @Post('raffle/:raffleId/initialize')
  async initializeTickets(@Param('raffleId') raffleId: string) {
    return this.ticketService.initializeTicketsForRaffle(raffleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('raffle/:raffleId')
  async getAllTickets(
    @Param('raffleId') raffleId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number, // Default más alto para tickets
  ): Promise<PaginatedTicketResponse> {
    const safeLimit = Math.min(limit, 500); // Límite máximo aún más alto para tickets si es necesario
    return this.ticketService.findTicketsByRafflePaginated(raffleId, page, safeLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('raffle/:raffleId/status/:status')
  async getTicketsByStatus(
    @Param('raffleId') raffleId: string,
    @Param('status') status: TicketStatus
  ) {
    return this.ticketService.findTicketsByStatus(raffleId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('raffle/:raffleId/number/:number')
  async getTicketByNumber(
    @Param('raffleId') raffleId: string,
    @Param('number') number: string
  ) {
    return this.ticketService.findTicketByNumber(raffleId, number);
  }

  @UseGuards(JwtAuthGuard)
  @Put('raffle/:raffleId/status')
  async updateMultipleTicketsStatus(
    @Param('raffleId') raffleId: string,
    @Body() updateDto: UpdateMultipleTicketsStatusDto
  ) {
    return this.ticketService.updateMultipleTicketsStatus(updateDto, raffleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('raffle/:raffleId/complete-sale')
  async completeSale(
    @Param('raffleId') raffleId: string,
    @Body() body: {
      ticketNumbers: string[];
      buyerInfo: {
        name: string;
        email?: string;
        phone?: string;
        transactionId?: string;
      }
    }
  ) {
    return this.ticketService.completeSale(
      raffleId,
      body.ticketNumbers,
      body.buyerInfo
    );
  }
}
