import { ApiService } from './api';
import { Ticket, TicketStatus, BuyerInfo, PaginatedResponse } from '../types';

export interface TicketStatusSummary {
  [TicketStatus.AVAILABLE]: number;
  [TicketStatus.RESERVED]: number;
  [TicketStatus.SOLD]: number;
}

export class TicketService {

  /**
   * Obtiene un resumen del estado de boletos para una rifa (panel admin)
   */
  static async getTicketStatusSummary(raffleId: string): Promise<TicketStatusSummary> {
    try {
      const response = await ApiService.get<TicketStatusSummary>(`/raffle/${raffleId}/tickets/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket status summary:', error);
      throw error;
    }
  }

  /**
   * Obtiene los tickets de una rifa de forma paginada (panel admin)
   */
  static async getTickets(raffleId: string, page: number, limit: number): Promise<PaginatedResponse<Ticket>> {
    try {
      const response = await ApiService.get<PaginatedResponse<Ticket>>(`/raffle/${raffleId}/tickets/paginated`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  /**
   * Inicializa los boletos para una rifa recién creada (panel admin)
   */
  static async initializeTickets(raffleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>(`/raffle/${raffleId}/initialize`);
      return response.data;
    } catch (error: any) {
      console.error('Error initializing tickets:', error);
      if (error?.response?.data?.message?.includes('Tickets already initialized')) {
        return {
          success: true,
          message: 'Los boletos ya estaban inicializados para esta rifa'
        };
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de múltiples boletos a la vez (panel admin)
   */
  static async updateMultipleTicketsStatus(
    raffleId: string,
    ticketNumbers: string[],
    status: TicketStatus
  ): Promise<any> {
    try {
      const response = await ApiService.patch(`/raffle/${raffleId}/tickets/status`, {
        ticketNumbers,
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  /**
   * Completa una venta de boletos (panel admin)
   */
  static async completeSale(
    raffleId: string,
    ticketNumbers: string[],
    buyerInfo: BuyerInfo
  ): Promise<any> {
    try {
      const response = await ApiService.post(`/raffle/${raffleId}/complete-sale`, { ticketNumbers, buyerInfo });
      return response.data;
    } catch (error) {
      console.error('Error completing sale:', error);
      throw error;
    }
  }

  /**
   * Descarga un boleto en formato PDF
   */
  static async downloadTicketPdf(raffleId: string, ticketNumber: string): Promise<void> {
    try {
      const response = await ApiService.get<Blob>(`/raffle/${raffleId}/tickets/${ticketNumber}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boleto-${ticketNumber}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

    } catch (error) {
      console.error('Error downloading ticket PDF:', error);
      throw new Error('No se pudo descargar el boleto. Por favor, intente de nuevo.');
    }
  }

  /**
   * Verifica un boleto por su ID (público)
   */
  static async verifyTicket(ticketId: string): Promise<any> {
    try {
      // Este endpoint es público en el backend
      const response = await ApiService.get(`/tickets/verify/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error verifying ticket:', error);
      throw error;
    }
  }

  // --- Métodos para la vista pública ---

  /**
   * Obtiene todos los boletos disponibles para una rifa (público)
   */
  static async getAvailableTickets(raffleId: string): Promise<Ticket[]> {
    try {
      const response = await ApiService.get<Ticket[]>(`/raffle/${raffleId}/tickets`);
      if (Array.isArray(response.data)) {
        return response.data.filter(t => t.status === TicketStatus.AVAILABLE);
      }
      return [];
    } catch (error) {
      console.error('Error fetching available tickets:', error);
      throw error;
    }
  }

  /**
   * Reserva boletos seleccionados por el usuario (público)
   */
  static async reserveTickets(raffleId: string, ticketNumbers: string[]): Promise<{ success: boolean; reservedTickets: string[] }> {
    try {
      const response = await ApiService.post<{ success: boolean; reservedTickets: string[] }>(
        `/raffle/${raffleId}/reserve-tickets`, 
        { ticketNumbers }
      );
      return response.data;
    } catch (error) {
      console.error('Error reserving tickets:', error);
      throw error;
    }
  }
}
