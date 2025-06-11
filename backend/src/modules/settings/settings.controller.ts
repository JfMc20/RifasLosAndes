import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/schemas/user.schema';
import { SettingsService } from './settings.service';
import { WhatsAppSettingsDto } from '../../common/dto/settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Obtiene todas las configuraciones del sistema
   */
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  /**
   * Actualiza la configuración de WhatsApp
   */
  @Put('whatsapp')
  async updateWhatsAppSettings(@Body() whatsappSettings: WhatsAppSettingsDto) {
    return this.settingsService.updateWhatsAppSettings(whatsappSettings);
  }

  /**
   * Envía un mensaje de prueba por WhatsApp
   */
  @Post('whatsapp/test')
  async sendTestWhatsAppMessage(@Body() body: { phoneNumber: string }) {
    return this.settingsService.sendTestWhatsAppMessage(body.phoneNumber);
  }
}