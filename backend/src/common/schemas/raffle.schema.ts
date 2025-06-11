import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Raffle extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  prize: string;

  @Prop({ required: true })
  totalTickets: number;

  @Prop({ required: true })
  ticketPrice: number;

  @Prop({ required: true })
  drawMethod: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const RaffleSchema = SchemaFactory.createForClass(Raffle);
