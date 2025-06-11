import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Raffle } from './raffle.schema';

export enum TicketStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold'
}

@Schema({ timestamps: true })
export class Ticket extends Document {
  @Prop({ required: true })
  number: string;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Raffle',
    required: true 
  })
  raffle: Raffle;

  @Prop({ 
    type: String, 
    enum: TicketStatus,
    default: TicketStatus.AVAILABLE 
  })
  status: TicketStatus;

  @Prop()
  buyerName?: string;

  @Prop()
  buyerEmail?: string;

  @Prop()
  buyerPhone?: string;

  @Prop()
  transactionId?: string;

  @Prop()
  notes?: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Crear índice compuesto para garantizar que los números de boleto sean únicos dentro de cada rifa
TicketSchema.index({ number: 1, raffle: 1 }, { unique: true });
