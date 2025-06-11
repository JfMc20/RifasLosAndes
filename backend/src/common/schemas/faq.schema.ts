import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FAQ extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
  
  @Prop({ default: 0 })
  order: number;
  
  @Prop({ default: true })
  isActive: boolean;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);
