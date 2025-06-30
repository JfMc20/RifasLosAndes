import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Module({
  providers: [PdfService],
  exports: [PdfService], // Export PdfService so other modules can use it
})
export class PdfModule {}
