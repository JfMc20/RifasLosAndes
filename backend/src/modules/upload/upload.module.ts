import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = resolve(process.cwd(), 'uploads');
          // Ensure directory exists
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
            console.log(`Created uploads directory at: ${uploadPath}`);
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          // Generate a unique filename for each uploaded file
          const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
          const ext = extname(file.originalname);
          const filename = `file-${uniqueSuffix}${ext}`;
          console.log(`Generating filename: ${filename} for original: ${file.originalname}`);
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Accept all file types for now
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
    AuthModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
