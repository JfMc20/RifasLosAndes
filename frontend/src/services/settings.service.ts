import { ApiService } from './api';

interface WhatsAppSettings {
  enabled: boolean;
  apiKey?: string;
  phoneNumberId?: string;
  fromPhoneNumber?: string;
  notificationTemplate?: string;
}

interface SystemSettings {
  whatsapp: WhatsAppSettings;
}

export class SettingsService {
  /**
   * Obtiene la configuración del sistema
   */
  static async getSettings(): Promise<SystemSettings> {
    try {
      const response = await ApiService.get<SystemSettings>('/settings');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      // Devolver valores por defecto si hay error
      return {
        whatsapp: {
          enabled: false
        }
      };
    }
  }

  /**
   * Actualiza la configuración de WhatsApp
   */
  static async updateWhatsAppSettings(settings: WhatsAppSettings): Promise<WhatsAppSettings> {
    try {
      const response = await ApiService.put<WhatsAppSettings>('/settings/whatsapp', settings);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar configuración de WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje de prueba de WhatsApp
   */
  static async sendTestWhatsAppMessage(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>('/settings/whatsapp/test', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje de prueba de WhatsApp:', error);
      return {
        success: false,
        message: 'Error al enviar mensaje de prueba'
      };
    }
  }
}
