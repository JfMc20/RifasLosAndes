import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Import feature modules
import { AuthModule } from './modules/auth/auth.module';
import { RaffleModule } from './modules/raffle/raffle.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { ContentModule } from './modules/content/content.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Database connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/rifa-los-andes',
      }),
      inject: [ConfigService],
    }),
    
    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    
    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        immutable: true,
        maxAge: 31536000000, // 1 year in ms
        fallthrough: false, // Importante: devuelve un 404 explícito si no encuentra el archivo
      },
    }),
    
    // Feature modules
    AuthModule,
    RaffleModule,
    TicketModule,
    UserModule,
    ContentModule,
    UploadModule,
    SettingsModule,
  ],
})
export class AppModule {}
