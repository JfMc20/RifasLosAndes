import { ApiService } from './api';
import { RaffleData, Raffle, Promotion, PaginatedResponse } from '../types'; // Añadir PaginatedResponse

export class RaffleService {
  /**
   * Obtiene los detalles de la rifa activa, incluyendo sus promociones
   */
  static async getActiveRaffleDetails(): Promise<RaffleData> {
    try {
      const response = await ApiService.get<{raffle: Raffle; promotions: Promotion[]}>('raffle/active-details');
      return {
        raffle: response.data.raffle,
        promotions: response.data.promotions,
      };
    } catch (error) {
      console.error('Error fetching active raffle details:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las rifas (para panel admin) de forma paginada.
   */
  static async getAllRaffles(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Raffle>> {
    try {
      const response = await ApiService.get<PaginatedResponse<Raffle>>(`raffle?page=${page}&limit=${limit}`);
      // Asumimos que la respuesta del backend ya tiene el formato PaginatedResponse<Raffle>
      // incluyendo data, currentPage, totalPages, totalItems
      return response.data;
    } catch (error) {
      console.error('Error fetching all raffles:', error);
      // Devolver una estructura de paginación vacía en caso de error para mantener la consistencia del tipo
      return {
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
      };
    }
  }

  /**
   * Obtiene una rifa específica por su ID
   */
  static async getRaffle(id: string): Promise<Raffle> {
    try {
      const response = await ApiService.get<Raffle>(`raffle/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffle with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva rifa (para panel admin)
   */
  static async createRaffle(raffleData: Omit<Raffle, '_id'>): Promise<Raffle> {
    try {
      const response = await ApiService.post<Raffle>('raffle', raffleData);
      return response.data;
    } catch (error) {
      console.error('Error creating raffle:', error);
      throw error;
    }
  }

  /**
   * Actualiza una rifa existente
   * @param id ID de la rifa
   * @param raffleData Datos de la rifa
   * @returns Información de la rifa actualizada
   */
  static async updateRaffle(id: string, raffleData: Partial<Raffle>): Promise<Raffle> {
    try {
      // Filtrar propiedades que no deben enviarse al servidor
      const { _id, createdAt, updatedAt, __v, ...filteredData } = raffleData as any;
      
      console.log(`Actualizando rifa con ID: ${id}`, filteredData);
      const response = await ApiService.put<Raffle>(`raffle/${id}`, filteredData);
      console.log('Rifa actualizada exitosamente:', response);
      
      // Si estamos en modo DEMO, podemos devolver un objeto simulado que incluya las actualizaciones
      if (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true') {
        return {
          ...filteredData,
          _id: id,
          name: filteredData.name || 'Nombre Demo',
          prize: filteredData.prize || 'Premio Demo',
          totalTickets: filteredData.totalTickets || 1000,
          ticketPrice: filteredData.ticketPrice || 100,
          drawMethod: filteredData.drawMethod || 'manual',
          isActive: filteredData.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Raffle;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la rifa:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva promoción para una rifa (para panel admin)
   */
  static async createPromotion(promotionData: Omit<Promotion, '_id'>): Promise<Promotion> {
    try {
      const response = await ApiService.post<Promotion>('raffle/promotion', promotionData);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  /**
   * Actualiza una promoción existente (para panel admin)
   */
  static async updatePromotion(id: string, promotionData: Partial<Promotion>): Promise<Promotion> {
    try {
      // Filtrar propiedades que no deben enviarse al servidor
      const { _id, createdAt, updatedAt, __v, raffle, ...filteredData } = promotionData as any;
      
      console.log(`Actualizando promoción con ID: ${id}`, filteredData);
      const response = await ApiService.put<Promotion>(`raffle/promotion/${id}`, filteredData);
      console.log('Promoción actualizada exitosamente:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating promotion with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las promociones de una rifa específica
   */
  static async getRafflePromotions(raffleId: string): Promise<Promotion[]> {
    try {
      const response = await ApiService.get<Promotion[]>(`raffle/${raffleId}/promotions`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener promociones de la rifa ${raffleId}:`, error);
      // Si no hay conexión o hay error, devolvemos un array vacío
      return [];
    }
  }

  /**
   * Elimina una promoción existente
   */
  static async deletePromotion(id: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await ApiService.delete(`raffle/promotion/${id}`);
      return { success: true, message: 'Promoción eliminada correctamente' };
    } catch (error) {
      console.error(`Error al eliminar promoción con id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una rifa existente (para panel admin)
   */
  static async deleteRaffle(id: string): Promise<{success: boolean, message: string}> {
    try {
      console.log(`Eliminando rifa con ID: ${id}`);
      const response = await ApiService.delete(`raffle/${id}`);
      console.log('Rifa eliminada exitosamente:', response);
      return { success: true, message: 'Rifa eliminada correctamente' };
    } catch (error) {
      console.error('Error al eliminar la rifa:', error);
      throw error;
    }
  }
}
