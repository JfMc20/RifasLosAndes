import { ApiService } from './api';

interface StatsData {
  totalTickets: number;
  soldTickets: number;
  reservedTickets: number;
  availableTickets: number;
  totalSales: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  recentTransactions: Transaction[];
  monthlySalesData: MonthlySalesData[];
  dailyTicketData: DailyTicketData[];
  salesByUser?: {
    [userId: string]: {
      username: string;
      name?: string;
      count: number;
      total: number;
    }
  };
}

interface Transaction {
  _id: string;
  raffleId: string;
  raffleName: string;
  ticketNumbers: string[];
  buyer: {
    name: string;
    phone: string;
    email?: string;
  };
  amount: number;
  paymentMethod: string;
  createdAt: string;
  userId?: string;
  userName?: string;
}

interface MonthlySalesData {
  month: string;
  sales: number;
  tickets: number;
}

interface DailyTicketData {
  date: string;
  sold: number;
  reserved: number;
}

export class StatsService {
  /**
   * Obtiene estadísticas generales del sistema
   */
  static async getDashboardStats(): Promise<StatsData> {
    try {
      const response = await ApiService.get('/stats/dashboard');
      if (response.data && typeof response.data === 'object') {
        return response.data as StatsData;
      } else {
        console.warn('Expected stats data object but got:', response.data);
        return this.getDefaultStatsData();
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return this.getDefaultStatsData();
    }
  }

  /**
   * Obtiene estadísticas de una rifa específica
   */
  static async getRaffleStats(raffleId: string): Promise<StatsData> {
    try {
      const response = await ApiService.get(`/stats/raffles/${raffleId}`);
      if (response.data && typeof response.data === 'object') {
        return response.data as StatsData;
      } else {
        console.warn('Expected stats data object but got:', response.data);
        return this.getDefaultStatsData();
      }
    } catch (error) {
      console.error(`Error fetching stats for raffle ${raffleId}:`, error);
      return this.getDefaultStatsData();
    }
  }

  /**
   * Obtiene estadísticas de ventas por usuario
   */
  static async getUserSalesStats(): Promise<StatsData['salesByUser']> {
    try {
      const response = await ApiService.get('/stats/users/sales');
      if (response.data && typeof response.data === 'object') {
        // Cast to the expected type
        return response.data as StatsData['salesByUser'];
      } else {
        console.warn('Expected object for user sales but got:', response.data);
        // Return empty object that conforms to the expected type
        return {} as StatsData['salesByUser'];
      }
    } catch (error) {
      console.error('Error fetching user sales stats:', error);
      return {} as StatsData['salesByUser'];
    }
  }

  /**
   * Exporta datos de ventas a CSV
   */
  static async exportSales(params: {
    raffleId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    try {
      // Use get method with responseType blob as getFileDownload is not available
      const response = await ApiService.get('/stats/export/sales', { 
        params,
        responseType: 'blob'
      });
      // Cast the response.data to ArrayBuffer which is a valid BlobPart
      return new Blob([response.data as ArrayBuffer], { type: 'text/csv' });
    } catch (error) {
      console.error('Error exporting sales data:', error);
      throw error;
    }
  }

  /**
   * Exporta datos de boletos a CSV
   */
  static async exportTickets(raffleId: string): Promise<Blob> {
    try {
      // Use get method with responseType blob as getFileDownload is not available
      const response = await ApiService.get(`/stats/export/tickets/${raffleId}`, { 
        responseType: 'blob'
      });
      // Cast the response.data to ArrayBuffer which is a valid BlobPart
      return new Blob([response.data as ArrayBuffer], { type: 'text/csv' });
    } catch (error) {
      console.error(`Error exporting tickets for raffle ${raffleId}:`, error);
      throw error;
    }
  }
  
  /**
   * Returns default stats data structure with empty values
   */
  private static getDefaultStatsData(): StatsData {
    return {
      totalTickets: 0,
      soldTickets: 0,
      reservedTickets: 0,
      availableTickets: 0,
      totalSales: 0,
      todaySales: 0,
      weekSales: 0,
      monthSales: 0,
      recentTransactions: [],
      monthlySalesData: [],
      dailyTicketData: [],
      salesByUser: {}
    };
  }
}
