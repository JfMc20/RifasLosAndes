import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InfoTicker extends Document {
  @Prop({ required: true })
  ticketPrice: string;

  @Prop({ required: true })
  drawDate: string;

  @Prop({ required: true })
  announcementChannel: string;

  @Prop({ required: false })
  additionalInfo: string;
}

export const InfoTickerSchema = SchemaFactory.createForClass(InfoTicker);
