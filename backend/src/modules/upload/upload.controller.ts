import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  UploadedFiles,
  UseGuards, 
  Res
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file provided' };
    }

    return {
      success: true,
      filename: file.filename,
      originalname: file.originalname,
      url: await this.uploadService.getFileUrl(file.filename),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const fileUrl = await this.uploadService.getFileUrl(filename);
      // Remove the leading slash
      const filePath = fileUrl.slice(1);
      return res.sendFile(filename, { root: './uploads' });
    } catch (error) {
      return res.status(404).json({ 
        success: false, 
        message: `File not found: ${filename}` 
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { success: true, message: `File ${filename} deleted successfully` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(`Received ${files?.length || 0} files for upload`);
    
    if (!files || files.length === 0) {
      return { success: false, message: 'No files provided' };
    }

    try {
      const uploadedFiles = await Promise.all(files.map(async (file) => {
        console.log(`Processing file: ${file.originalname}, saved as ${file.filename}`);
        return {
          success: true,
          filename: file.filename,
          originalname: file.originalname,
          url: await this.uploadService.getFileUrl(file.filename),
          size: file.size,
          mimetype: file.mimetype,
        };
      }));

      console.log(`Successfully processed ${uploadedFiles.length} files`);
      return {
        success: true,
        files: uploadedFiles
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      return {
        success: false,
        message: error.message || 'Error uploading files',
        error: error.toString()
      };
    }
  }

  @Get()
  async getAllFiles() {
    const files = await this.uploadService.getAllFiles();
    const fileUrls = await Promise.all(
      files.map(async (filename) => {
        try {
          const url = await this.uploadService.getFileUrl(filename);
          return { filename, url };
        } catch (error) {
          return null;
        }
      })
    );

    return {
      success: true,
      files: fileUrls.filter(Boolean),
    };
  }
}
