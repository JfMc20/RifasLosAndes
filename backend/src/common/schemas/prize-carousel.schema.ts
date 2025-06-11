import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PrizeCarouselContentDocument = PrizeCarouselContent & Document;

@Schema({ timestamps: true })
export class PrizeCarouselContent extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  images: string[];
}

export const PrizeCarouselContentSchema = SchemaFactory.createForClass(PrizeCarouselContent);
