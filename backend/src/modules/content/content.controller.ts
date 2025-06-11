import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateHeroContentDto,
  UpdateHeroContentDto,
  CreateFAQDto,
  UpdateFAQDto,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from '../../common/dto/content.dto';
import {
  CreatePrizeCarouselContentDto,
  UpdatePrizeCarouselContentDto,
} from '../../common/dto/prize-carousel.dto';
import {
  CreateInfoTickerDto,
  UpdateInfoTickerDto,
} from '../../common/dto/info-ticker.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Public endpoints
  @Get('website-content')
  async getWebsiteContent() {
    return this.contentService.getAllWebsiteContent();
  }
  
  @Get('hero')
  async getHeroContent() {
    return this.contentService.getHeroContent();
  }

  @Get('faqs')
  async getAllFAQs() {
    return this.contentService.getAllFAQs();
  }

  @Get('payment-methods')
  async getAllPaymentMethods() {
    return this.contentService.getAllPaymentMethods();
  }

  @Get('prize-carousel')
  async getPrizeCarouselContent() {
    return this.contentService.getPrizeCarouselContent();
  }

  @Get('info-ticker')
  async getInfoTicker() {
    return this.contentService.getInfoTicker();
  }

  // Protected endpoints (Admin only)
  @UseGuards(JwtAuthGuard)
  @Post('hero')
  async createHeroContent(@Body() createHeroContentDto: CreateHeroContentDto) {
    return this.contentService.createHeroContent(createHeroContentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('hero/:id')
  async updateHeroContent(
    @Param('id') id: string,
    @Body() updateHeroContentDto: UpdateHeroContentDto
  ) {
    return this.contentService.updateHeroContent(id, updateHeroContentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('faq')
  async createFAQ(@Body() createFAQDto: CreateFAQDto) {
    return this.contentService.createFAQ(createFAQDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('faq/:id')
  async updateFAQ(
    @Param('id') id: string,
    @Body() updateFAQDto: UpdateFAQDto
  ) {
    return this.contentService.updateFAQ(id, updateFAQDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('faq/:id')
  async deleteFAQ(@Param('id') id: string) {
    return this.contentService.deleteFAQ(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('faqs/reorder')
  async reorderFAQs(@Body() body: { orderedIds: string[] }) {
    return this.contentService.reorderFAQs(body.orderedIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment-method')
  async createPaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.contentService.createPaymentMethod(createPaymentMethodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('payment-method/:id')
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ) {
    return this.contentService.updatePaymentMethod(id, updatePaymentMethodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('payment-method/:id')
  async deletePaymentMethod(@Param('id') id: string) {
    return this.contentService.deletePaymentMethod(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('payment-methods/reorder')
  async reorderPaymentMethods(@Body() body: { orderedIds: string[] }) {
    return this.contentService.reorderPaymentMethods(body.orderedIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('prize-carousel')
  async createPrizeCarouselContent(@Body() createDto: CreatePrizeCarouselContentDto) {
    return this.contentService.createPrizeCarouselContent(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('prize-carousel/:id')
  async updatePrizeCarouselContent(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrizeCarouselContentDto
  ) {
    return this.contentService.updatePrizeCarouselContent(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('info-ticker')
  async createInfoTicker(@Body() createDto: CreateInfoTickerDto) {
    return this.contentService.createInfoTicker(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('info-ticker/:id')
  async updateInfoTicker(
    @Param('id') id: string,
    @Body() updateDto: UpdateInfoTickerDto
  ) {
    return this.contentService.updateInfoTicker(id, updateDto);
  }
}
