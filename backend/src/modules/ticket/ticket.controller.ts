import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, DefaultValuePipe, ParseIntPipe, Patch, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { TicketService, PaginatedTicketResponse } from './ticket.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TicketStatus } from '../../common/schemas/ticket.schema';
import { UpdateTicketDto, UpdateMultipleTicketsStatusDto } from '../../common/dto/ticket.dto';

@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // Public endpoint for QR code verification
  @Get('tickets/verify/:id')
  async verifyTicketById(@Param('id') id: string) {
    return this.ticketService.verifyTicketById(id);
  }

  // Public endpoints
  @Get('raffle/:raffleId/tickets')
  async findTicketsByRaffle(@Param('raffleId') raffleId: string) {
    return this.ticketService.findTicketsByRaffle(raffleId);
  }

  @Post('raffle/:raffleId/reserve-tickets')
  async reserveTickets(
    @Param('raffleId') raffleId: string,
    @Body() body: { ticketNumbers: string[] },
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
  @Get('raffle/:raffleId/tickets/paginated')
  async findTicketsPaginated(
    @Param('raffleId') raffleId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedTicketResponse> {
    const safeLimit = Math.min(limit, 500);
    return this.ticketService.findTicketsByRafflePaginated(raffleId, page, safeLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('raffle/:raffleId/tickets/summary')
  async getTicketSummary(@Param('raffleId') raffleId: string) {
    return this.ticketService.getTicketStatusSummary(raffleId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('raffle/:raffleId/tickets/status')
  async updateMultipleTicketsStatus(
    @Param('raffleId') raffleId: string,
    @Body() updateDto: UpdateMultipleTicketsStatusDto,
  ) {
    return this.ticketService.updateMultipleTicketsStatus(updateDto, raffleId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('raffle/:raffleId/complete-sale')
  async completeSale(
    @Param('raffleId') raffleId: string,
    @Body() body: { ticketNumbers: string[], buyerInfo: { name: string, email?: string, phone?: string, transactionId?: string } },
  ) {
    const { ticketNumbers, buyerInfo } = body;
    return this.ticketService.completeSale(raffleId, ticketNumbers, buyerInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('raffle/:raffleId/tickets/:ticketNumber/pdf')
  async getTicketPdf(
    @Param('raffleId') raffleId: string,
    @Param('ticketNumber') ticketNumber: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfBuffer = await this.ticketService.generateTicketPdf(raffleId, ticketNumber);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=boleto-${ticketNumber}.pdf`);

    return new StreamableFile(pdfBuffer);
  }
}
