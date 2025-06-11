import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadsDir: string;

  constructor() {
    // Use absolute path for uploads directory
    this.uploadsDir = resolve(process.cwd(), 'uploads');
    // Ensure uploads directory exists
    this.ensureUploadsDir();
    console.log(`Uploads directory set to: ${this.uploadsDir}`);
  }

  private ensureUploadsDir() {
    // Use sync methods to ensure directory exists before any operations
    if (!existsSync(this.uploadsDir)) {
      console.log(`Creating uploads directory: ${this.uploadsDir}`);
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    const filePath = join(this.uploadsDir, filename);
    try {
      await fs.access(filePath);
      return `/uploads/${filename}`;
    } catch (error) {
      console.error(`File not found: ${filePath}`);
      throw new NotFoundException(`File ${filename} not found`);
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = join(this.uploadsDir, filename);
      await fs.access(filePath);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw new NotFoundException(`File ${filename} not found or could not be deleted`);
    }
  }

  async getAllFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      return files;
    } catch (error) {
      return [];
    }
  }
}
