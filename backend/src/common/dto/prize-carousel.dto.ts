import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePrizeCarouselContentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}

export class UpdatePrizeCarouselContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
