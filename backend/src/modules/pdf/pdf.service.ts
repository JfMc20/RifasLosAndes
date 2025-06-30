import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as qrcode from 'qrcode';

@Injectable()
export class PdfService {
  constructor(private readonly configService: ConfigService) {}

  // Helper function to add details in a structured way
  private addDetail(doc: PDFKit.PDFDocument, label: string, value: string) {
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(label, { continued: true })
      .font('Helvetica')
      .text(` ${value || 'N/A'}`);
    doc.moveDown(0.7);
  }

  private drawTicketBorder(doc: PDFKit.PDFDocument) {
    const margin = 12;
    const width = doc.page.width - margin * 2;
    const height = doc.page.height - margin * 2;
    doc
      .save()
      .lineWidth(1.5)
      .strokeColor('#555555')
      .roundedRect(margin, margin, width, height, 5)
      .stroke()
      .restore();
  }

  async generateTicketPdf(ticket: any): Promise<Buffer> {
    return new Promise(async (resolve) => {
      const doc = new PDFDocument({
        size: [302, 520], // Approx ticket size in points (w, h)
        margins: {
          top: 20,
          bottom: 20,
          left: 25,
          right: 25,
        },
      });

      this.drawTicketBorder(doc);

      // --- QR Code Generation ---
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const verificationUrl = `${frontendUrl}/verify?ticketId=${ticket._id}`;
      const qrImage = await qrcode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      // --- PDF Content ---

      // Header
      doc.font('Helvetica-Bold').fontSize(18).text('Rifas Los Andes', { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10).text('¡Gracias por tu compra!', { align: 'center' });

      // Separator
      doc.moveDown(1).strokeColor('#cccccc').lineWidth(0.5).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
      doc.moveDown(1.5);

      // Main Info
      doc.font('Helvetica-Bold').fontSize(16).text(`Boleto #${ticket.number}`, { align: 'center' });
      doc.moveDown(1.5);

      // Details
      this.addDetail(doc, 'Rifa:', ticket.raffle.name);
      this.addDetail(doc, 'Premio:', ticket.raffle.prize);
      this.addDetail(doc, 'Comprador:', ticket.buyerName);
      this.addDetail(doc, 'Teléfono:', ticket.buyerPhone);
      this.addDetail(doc, 'Sorteo:', ticket.raffle.drawMethod);

      // QR Code Section
      const qrWidth = 110;
      const qrX = (doc.page.width - qrWidth) / 2;
      // Draw the QR code and then move the cursor below it
      doc.image(qrImage, qrX, doc.y, { fit: [qrWidth, qrWidth] });
      doc.y += qrWidth + 10; // Move cursor down past the QR code + a margin

      // Now, draw the text in the new, clear position
      doc.font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#333333')
        .text('Escanea para verificar tu boleto', { align: 'center' });

      // Footer
      doc.y = doc.page.height - doc.page.margins.bottom - 10;
      doc.font('Helvetica').fontSize(7).text('¡Mucha suerte!', { align: 'center' });

      // Finalize the PDF and get the buffer
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.end();
    });
  }
}
