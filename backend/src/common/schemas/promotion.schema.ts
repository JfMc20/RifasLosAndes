import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Raffle } from './raffle.schema';

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Raffle',
    required: true 
  })
  raffle: Raffle;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
