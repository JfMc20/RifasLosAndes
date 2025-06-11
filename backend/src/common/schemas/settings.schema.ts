import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Esquema para configuración de WhatsApp
@Schema({ _id: false })
export class WhatsAppSettings {
  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  apiKey?: string;

  @Prop()
  phoneNumberId?: string;

  @Prop()
  fromPhoneNumber?: string;

  @Prop()
  notificationTemplate?: string;
}

// Esquema para todas las configuraciones del sistema
@Schema({ timestamps: true, collection: 'settings' })
export class Settings extends Document {
  @Prop({ type: WhatsAppSettings, default: () => ({ enabled: false }) })
  whatsapp: WhatsAppSettings;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);