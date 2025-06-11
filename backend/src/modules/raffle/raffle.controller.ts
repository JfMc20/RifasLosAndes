import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { RaffleService, ActiveRaffleWithPromotions } from './raffle.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRaffleDto, UpdateRaffleDto } from '../../common/dto/raffle.dto';
import { CreatePromotionDto, UpdatePromotionDto } from '../../common/dto/promotion.dto';
import { TicketService } from '../ticket/ticket.service';
import { Raffle } from '../../common/schemas/raffle.schema';

@Controller('raffle')
export class RaffleController {
  constructor(
    private readonly raffleService: RaffleService,
    private readonly ticketService: TicketService
  ) {}

  // Public endpoints
  @Get('active-details')
  async getActiveRaffleDetails() {
    return this.raffleService.getActiveRaffleWithPromotions();
  }

  @Get('active-with-tickets')
  async getActiveRaffleWithTickets() {
    try {
      // Obtener la rifa activa directamente (esto garantiza el tipo correcto)
      const raffle = await this.raffleService.findActiveRaffle();
      
      // Obtener las promociones para esta rifa
      const promotions = await this.raffleService.findPromotionsByRaffleId(raffle.id);
      
      // Obtener tickets usando el ID como string que proporciona Mongoose
      // Mongoose proporciona .id como getter que devuelve el _id como string
      const tickets = await this.ticketService.findTicketsByRaffle(raffle.id);
      
      return {
        raffle,
        promotions,
        tickets
      };
    } catch (error) {
      console.error('Error obteniendo rifa activa con tickets:', error);
      throw error;
    }
  }

  // Admin endpoints (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.raffleService.findAllRaffles();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.raffleService.findRaffleById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRaffleDto: CreateRaffleDto) {
    return this.raffleService.createRaffle(createRaffleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRaffleDto: UpdateRaffleDto) {
    return this.raffleService.updateRaffle(id, updateRaffleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.raffleService.deleteRaffle(id);
  }

  // Promotion endpoints
  @UseGuards(JwtAuthGuard)
  @Get(':raffleId/promotions')
  async findPromotions(@Param('raffleId') raffleId: string) {
    return this.raffleService.findPromotionsByRaffleId(raffleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('promotion')
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto) {
    return this.raffleService.createPromotion(createPromotionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('promotion/:id')
  async updatePromotion(
    @Param('id') id: string, 
    @Body() updatePromotionDto: UpdatePromotionDto
  ) {
    return this.raffleService.updatePromotion(id, updatePromotionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('promotion/:id')
  async removePromotion(@Param('id') id: string) {
    return this.raffleService.deletePromotion(id);
  }
}
