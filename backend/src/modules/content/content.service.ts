import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroContent } from '../../common/schemas/hero-content.schema';
import { FAQ } from '../../common/schemas/faq.schema';
import { PaymentMethod } from '../../common/schemas/payment-method.schema';
import { PrizeCarouselContent } from '../../common/schemas/prize-carousel.schema';
import { InfoTicker } from '../../common/schemas/info-ticker.schema';
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

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(HeroContent.name) private heroContentModel: Model<HeroContent>,
    @InjectModel(FAQ.name) private faqModel: Model<FAQ>,
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethod>,
    @InjectModel(PrizeCarouselContent.name) private prizeCarouselContentModel: Model<PrizeCarouselContent>,
    @InjectModel(InfoTicker.name) private infoTickerModel: Model<InfoTicker>,
  ) {}

  // Hero Content Methods
  async getHeroContent() {
    // Return the most recently created hero content
    const heroContent = await this.heroContentModel.findOne().sort({ createdAt: -1 }).exec();
    
    if (!heroContent) {
      throw new NotFoundException('Hero content not found');
    }
    
    return heroContent;
  }

  async createHeroContent(createHeroContentDto: CreateHeroContentDto) {
    const newHeroContent = new this.heroContentModel(createHeroContentDto);
    return newHeroContent.save();
  }

  async updateHeroContent(id: string, updateHeroContentDto: UpdateHeroContentDto) {
    const updatedHeroContent = await this.heroContentModel
      .findByIdAndUpdate(id, updateHeroContentDto, { new: true })
      .exec();
    
    if (!updatedHeroContent) {
      throw new NotFoundException(`Hero content with ID ${id} not found`);
    }
    
    return updatedHeroContent;
  }

  // FAQ Methods
  async getAllFAQs() {
    return this.faqModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  async getFAQById(id: string) {
    const faq = await this.faqModel.findById(id).exec();
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    return faq;
  }

  async createFAQ(createFAQDto: CreateFAQDto) {
    const newFAQ = new this.faqModel(createFAQDto);
    return newFAQ.save();
  }

  async updateFAQ(id: string, updateFAQDto: UpdateFAQDto) {
    const updatedFAQ = await this.faqModel
      .findByIdAndUpdate(id, updateFAQDto, { new: true })
      .exec();
    
    if (!updatedFAQ) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    return updatedFAQ;
  }

  async deleteFAQ(id: string) {
    const deletedFAQ = await this.faqModel.findByIdAndDelete(id).exec();
    
    if (!deletedFAQ) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    return deletedFAQ;
  }

  async reorderFAQs(orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.faqModel
        .findByIdAndUpdate(orderedIds[i], { order: i })
        .exec();
    }
    
    return this.getAllFAQs();
  }

  // Payment Method Methods
  async getAllPaymentMethods() {
    return this.paymentMethodModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  async getPaymentMethodById(id: string) {
    const paymentMethod = await this.paymentMethodModel.findById(id).exec();
    
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    return paymentMethod;
  }

  async createPaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto) {
    const newPaymentMethod = new this.paymentMethodModel(createPaymentMethodDto);
    return newPaymentMethod.save();
  }

  async updatePaymentMethod(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const updatedPaymentMethod = await this.paymentMethodModel
      .findByIdAndUpdate(id, updatePaymentMethodDto, { new: true })
      .exec();
    
    if (!updatedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    return updatedPaymentMethod;
  }

  async deletePaymentMethod(id: string) {
    const deletedPaymentMethod = await this.paymentMethodModel.findByIdAndDelete(id).exec();
    
    if (!deletedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    
    return deletedPaymentMethod;
  }

  async reorderPaymentMethods(orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.paymentMethodModel
        .findByIdAndUpdate(orderedIds[i], { order: i })
        .exec();
    }
    
    return this.getAllPaymentMethods();
  }

  // Prize Carousel Content Methods
  async getPrizeCarouselContent() {
    // Return the most recently created prize carousel content
    const prizeCarouselContent = await this.prizeCarouselContentModel.findOne().sort({ createdAt: -1 }).exec();
    
    if (!prizeCarouselContent) {
      throw new NotFoundException('Prize carousel content not found');
    }
    
    return prizeCarouselContent;
  }

  async createPrizeCarouselContent(createDto: CreatePrizeCarouselContentDto) {
    const newContent = new this.prizeCarouselContentModel(createDto);
    return newContent.save();
  }

  async updatePrizeCarouselContent(id: string, updateDto: UpdatePrizeCarouselContentDto) {
    const updatedContent = await this.prizeCarouselContentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    
    if (!updatedContent) {
      throw new NotFoundException(`Prize carousel content with ID ${id} not found`);
    }
    
    return updatedContent;
  }

  // Info Ticker Methods
  async getInfoTicker() {
    // Return the most recently created info ticker content
    const infoTicker = await this.infoTickerModel.findOne().sort({ createdAt: -1 }).exec();
    
    if (!infoTicker) {
      throw new NotFoundException('Info ticker content not found');
    }
    
    return infoTicker;
  }

  async createInfoTicker(createDto: CreateInfoTickerDto) {
    const newInfoTicker = new this.infoTickerModel(createDto);
    return newInfoTicker.save();
  }

  async updateInfoTicker(id: string, updateDto: UpdateInfoTickerDto) {
    const updatedInfoTicker = await this.infoTickerModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    
    if (!updatedInfoTicker) {
      throw new NotFoundException(`Info ticker with ID ${id} not found`);
    }
    
    return updatedInfoTicker;
  }

  // Get All Website Content
  async getAllWebsiteContent() {
    const [heroContent, prizeCarouselContent, infoTicker, faqs, paymentMethods] = await Promise.all([
      this.getHeroContent().catch(() => null),
      this.getPrizeCarouselContent().catch(() => null),
      this.getInfoTicker().catch(() => null),
      this.getAllFAQs(),
      this.getAllPaymentMethods(),
    ]);
    
    return {
      heroContent,
      prizeCarouselContent,
      infoTicker,
      faqs,
      paymentMethods,
    };
  }
}
