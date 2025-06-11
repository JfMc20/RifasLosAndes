import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class WhatsAppSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  phoneNumberId?: string;

  @IsString()
  @IsOptional()
  fromPhoneNumber?: string;

  @IsString()
  @IsOptional()
  notificationTemplate?: string;
}

export class UpdateWhatsAppSettingsDto extends WhatsAppSettingsDto {}