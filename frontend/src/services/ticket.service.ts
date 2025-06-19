import { ApiService } from './api';
import { Ticket, TicketStatus } from '../types';

export interface TicketStatusSummary {
  [TicketStatus.AVAILABLE]: number;
  [TicketStatus.RESERVED]: number;
  [TicketStatus.SOLD]: number;
}

export class TicketService {
  /**
   * Obtiene un resumen del estado de boletos para una rifa
   */
  static async getTicketStatusSummary(raffleId: string): Promise<TicketStatusSummary> {
    try {
      const response = await ApiService.get<TicketStatusSummary>(`ticket/raffle/${raffleId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket status summary:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los boletos disponibles para una rifa
   */
  static async getAvailableTickets(raffleId: string): Promise<Ticket[]> {
    try {
      const response = await ApiService.get<Ticket[]>(`ticket/raffle/${raffleId}/available`);
      // Ensure we have an array of tickets
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Expected array of tickets but got:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching available tickets:', error);
      throw error;
    }
  }

  /**
   * Reserva boletos seleccionados por el usuario
   */
  static async reserveTickets(raffleId: string, ticketNumbers: string[]): Promise<{ success: boolean; reservedTickets: string[] }> {
    try {
      const response = await ApiService.post<{ success: boolean; reservedTickets: string[] }>(
        `ticket/raffle/${raffleId}/reserve`, 
        { ticketNumbers }
      );
      return response.data;
    } catch (error) {
      console.error('Error reserving tickets:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los boletos de una rifa (para panel admin)
   */
  static async getAllTickets(raffleId: string): Promise<Ticket[]> {
    try {
      const response = await ApiService.get<Ticket[]>(`ticket/raffle/${raffleId}`);
      // Ensure we have an array of tickets
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Expected array of tickets but got:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  }

  /**
   * Inicializa los boletos para una rifa recién creada (panel admin)
   */
  static async initializeTickets(raffleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>(
        `ticket/raffle/${raffleId}/initialize`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error initializing tickets:', error);
      
      // Verificar si es error de duplicación de boletos
      if (error?.response?.data?.message?.includes('Tickets already initialized')) {
        // Si ya están inicializados, consideramos esto un éxito para evitar errores en la UI
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
  ): Promise<{ success: boolean; modifiedCount: number; ticketNumbers: string[], newStatus: TicketStatus }> {
    try {
      const response = await ApiService.put<any>(
        `ticket/raffle/${raffleId}/status`,
        { ticketNumbers, status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating multiple tickets status:', error);
      throw error;
    }
  }

  /**
   * Completa una venta de boletos (panel admin)
   */
  static async completeSale(
    raffleId: string,
    ticketNumbers: string[],
    buyerInfo: {
      name: string;
      email?: string;
      phone?: string;
      transactionId?: string;
    }
  ): Promise<{
    success: boolean;
    modifiedCount: number;
    ticketNumbers: string[];
    buyer: any;
  }> {
    try {
      const response = await ApiService.post<any>(
        `ticket/raffle/${raffleId}/complete-sale`,
        { ticketNumbers, buyerInfo }
      );
      return response.data;
    } catch (error) {
      console.error('Error completing sale:', error);
      throw error;
    }
  }
}
