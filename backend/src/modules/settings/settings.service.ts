import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '../../common/schemas/settings.schema';
import { WhatsAppSettingsDto } from '../../common/dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  /**
   * Obtiene todas las configuraciones del sistema
   * Si no existen, crea un registro por defecto
   */
  async getSettings(): Promise<Settings> {
    const settings = await this.settingsModel.findOne().exec();
    
    if (settings) {
      return settings;
    }
    
    // Si no existen configuraciones, crear por defecto
    const defaultSettings = new this.settingsModel({
      whatsapp: { enabled: false }
    });
    
    return defaultSettings.save();
  }

  /**
   * Actualiza la configuración de WhatsApp
   */
  async updateWhatsAppSettings(whatsappSettings: WhatsAppSettingsDto): Promise<Settings> {
    const settings = await this.getSettings();
    
    settings.whatsapp = {
      ...settings.whatsapp,
      ...whatsappSettings
    };
    
    return settings.save();
  }

  /**
   * Envía un mensaje de prueba por WhatsApp
   */
  async sendTestWhatsAppMessage(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings();
    
    if (!settings.whatsapp.enabled) {
      return { 
        success: false, 
        message: 'La integración con WhatsApp no está habilitada' 
      };
    }
    
    if (!settings.whatsapp.apiKey || !settings.whatsapp.phoneNumberId || !settings.whatsapp.fromPhoneNumber) {
      return { 
        success: false, 
        message: 'Falta información de configuración de WhatsApp' 
      };
    }
    
    try {
      // Aquí iría la lógica para enviar un mensaje real usando la API de WhatsApp
      // Por ahora simulamos éxito
      
      console.log(`Simulando envío de mensaje de prueba a ${phoneNumber}`);
      
      // TODO: Implementar integración real con WhatsApp Business API
      
      return {
        success: true,
        message: `Mensaje de prueba enviado con éxito al número ${phoneNumber}`
      };
    } catch (error) {
      console.error('Error al enviar mensaje de prueba:', error);
      return {
        success: false,
        message: `Error al enviar mensaje: ${error.message}`
      };
    }
  }
}