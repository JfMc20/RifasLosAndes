import { IsString, IsNumber, IsMongoId } from 'class-validator';

export class CreatePromotionDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsMongoId()
  raffle: string;
}

export class UpdatePromotionDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  description: string;
}
