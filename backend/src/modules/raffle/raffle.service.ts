import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Raffle } from '../../common/schemas/raffle.schema';
import { Promotion } from '../../common/schemas/promotion.schema';
import { CreateRaffleDto, UpdateRaffleDto } from '../../common/dto/raffle.dto';
import { CreatePromotionDto, UpdatePromotionDto } from '../../common/dto/promotion.dto';

// Definir interface para el retorno de getActiveRaffleWithPromotions
export interface ActiveRaffleWithPromotions {
  raffle: Raffle;
  promotions: Promotion[];
}

// Interfaz para la respuesta paginada
export interface PaginatedRaffleResponse {
  data: Raffle[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

@Injectable()
export class RaffleService {
  constructor(
    @InjectModel(Raffle.name) private raffleModel: Model<Raffle>,
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
  ) {}

  // Raffle methods
  async findAllRaffles() { // Esta podría ser deprecada o usada internamente
    console.log('Finding all raffles (non-paginated)...');
    const raffles = await this.raffleModel.find().sort({ createdAt: -1 }).exec();
    console.log(`Found ${raffles.length} raffles`);
    return raffles;
  }

  async findAllRafflesPaginated(page: number, limit: number): Promise<PaginatedRaffleResponse> {
    const skip = (page - 1) * limit;
    const totalItems = await this.raffleModel.countDocuments().exec();
    const totalPages = Math.ceil(totalItems / limit);

    console.log(`Finding raffles paginated: page ${page}, limit ${limit}, skip ${skip}, totalItems ${totalItems}`);

    const data = await this.raffleModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    console.log(`Found ${data.length} raffles for page ${page}`);
    return { data, currentPage: page, totalPages, totalItems };
  }

  async findActiveRaffle(): Promise<Raffle> {
    const activeRaffle = await this.raffleModel.findOne({ isActive: true }).exec();
    
    if (!activeRaffle) {
      throw new NotFoundException('No active raffle found');
    }
    
    return activeRaffle;
  }

  async findRaffleById(id: string) {
    const raffle = await this.raffleModel.findById(id).exec();
    
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${id} not found`);
    }
    
    return raffle;
  }

  async createRaffle(createRaffleDto: CreateRaffleDto) {
    if (createRaffleDto.isActive) {
      // If new raffle is active, deactivate all other raffles
      await this.raffleModel.updateMany({}, { isActive: false }).exec();
    }
    
    // Verificar si ya existe una rifa con el mismo nombre para evitar duplicados
    const existingRaffle = await this.raffleModel.findOne({ name: createRaffleDto.name }).exec();
    if (existingRaffle) {
      throw new BadRequestException(`Ya existe una rifa con el nombre '${createRaffleDto.name}'`);
    }
    
    const newRaffle = new this.raffleModel(createRaffleDto);
    const savedRaffle = await newRaffle.save();
    
    // Devolver la rifa recién creada
    return savedRaffle;
  }

  async updateRaffle(id: string, updateRaffleDto: UpdateRaffleDto) {
    if (updateRaffleDto.isActive === true) {
      // If raffle is being activated, deactivate all other raffles
      await this.raffleModel.updateMany({ _id: { $ne: id } }, { isActive: false }).exec();
    }
    
    const updatedRaffle = await this.raffleModel
      .findByIdAndUpdate(id, updateRaffleDto, { new: true })
      .exec();
    
    if (!updatedRaffle) {
      throw new NotFoundException(`Raffle with ID ${id} not found`);
    }
    
    return updatedRaffle;
  }

  async deleteRaffle(id: string) {
    const deletedRaffle = await this.raffleModel.findByIdAndDelete(id).exec();
    
    if (!deletedRaffle) {
      throw new NotFoundException(`Raffle with ID ${id} not found`);
    }
    
    return deletedRaffle;
  }

  // Promotion methods
  async findPromotionsByRaffleId(raffleId: string) {
    return this.promotionModel.find({ raffle: raffleId }).sort({ quantity: 1 }).exec();
  }

  async createPromotion(createPromotionDto: CreatePromotionDto) {
    const raffle = await this.raffleModel.findById(createPromotionDto.raffle).exec();
    
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${createPromotionDto.raffle} not found`);
    }
    
    const newPromotion = new this.promotionModel(createPromotionDto);
    return newPromotion.save();
  }

  async updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto) {
    const updatedPromotion = await this.promotionModel
      .findByIdAndUpdate(id, updatePromotionDto, { new: true })
      .exec();
    
    if (!updatedPromotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    
    return updatedPromotion;
  }

  async deletePromotion(id: string) {
    const deletedPromotion = await this.promotionModel.findByIdAndDelete(id).exec();
    
    if (!deletedPromotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    
    return deletedPromotion;
  }

  // Get active raffle with all its promotions
  async getActiveRaffleWithPromotions(): Promise<ActiveRaffleWithPromotions> {
    const activeRaffle = await this.findActiveRaffle();
    // Usar el ID de la rifa para buscar sus promociones
    const promotions = await this.findPromotionsByRaffleId(activeRaffle.id);
    
    return {
      raffle: activeRaffle,
      promotions,
    };
  }
}
