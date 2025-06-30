import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notification.service';
import { Raffle, Ticket, TicketStatus, BuyerInfo } from '../types';
import { RaffleService } from '../services/raffle.service';
import { TicketService } from '../services/ticket.service';

export interface UseTicketsResult {
  // Estado
  raffle: Raffle | null;
  tickets: Ticket[];
  loading: boolean;
  error: string;
  filterStatus: TicketStatus | 'all';
  searchQuery: string;
  currentPage: number;
  selectedTickets: string[];
  currentTickets: Ticket[];
  totalPages: number;
  totalItems: number;
  ticketsPerPage: number;
  buyerInfo: BuyerInfo;
  showSaleModal: boolean;
  debugInfo: any; // Información de depuración
  
  // Índices para paginación
  indexOfFirstTicket: number;
  indexOfLastTicket: number;
  
  // Métodos
  setFilterStatus: (status: TicketStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleTicketSelection: (ticketNumber: string) => void;
  selectAll: (selected: boolean) => void;
  updateTicketsStatus: (status: TicketStatus, ticketNumbers?: string[]) => Promise<void>;
  completeSale: () => Promise<void>;
  openSaleModal: (ticketNumbers?: string[]) => void;
  closeSaleModal: () => void;
  setBuyerInfo: (info: BuyerInfo) => void;
  paginate: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  fetchData: () => Promise<void>; // Método para recargar datos manualmente
}

export const useTickets = (raffleId: string | undefined): UseTicketsResult => {
  // Estados principales
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]); // Tickets de la página actual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Estados para manejo de tickets
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para paginación - ticketsPerPage es constante, totalPages y totalItems vendrán del backend
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(100); // Podría ser configurable
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0); // Total de tickets (filtrados o no)
  
  // Estados para venta
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: '',
    email: '',
    phone: '',
    transactionId: '',
  });
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Función para cargar datos
  const fetchData = useCallback(async (pageToFetch: number = currentPage) => {
    if (!raffleId) {
      setError('No se proporcionó ID de rifa válido');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Obtener datos de la rifa (solo si aún no se han cargado)
      if (!raffle) {
        const raffleData = await RaffleService.getRaffle(raffleId);
        setRaffle(raffleData);
      }
      
      // TODO: Idealmente, el backend debería manejar filterStatus y searchQuery
      // Por ahora, para la paginación, los ignoraremos en la llamada al backend
      // y el filtrado/búsqueda se aplicaría sobre los datos de la página actual si se mantiene esa lógica.
      // O, si el backend los soporta, se pasarían aquí:
      // const params = { page: pageToFetch, limit: ticketsPerPage, status: filterStatus, search: searchQuery };
      const response = await TicketService.getTickets(raffleId, pageToFetch, ticketsPerPage);
      
      setTickets(response.data);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage); // Asegurar que currentPage se actualice desde la respuesta

      // Limpiar selección si cambiamos de página y los tickets seleccionados ya no están visibles
      // Esta lógica es compleja si los tickets seleccionados pueden estar en otras páginas.
      // Por simplicidad, limpiaremos la selección al cambiar de página.
      setSelectedTickets([]);

    } catch (err: any) {
      console.error('Error loading tickets data:', err);
      setError(err.message || 'Error al cargar los datos de boletos');
      setTickets([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [raffleId, raffle, currentPage, ticketsPerPage, filterStatus, searchQuery]); // filterStatus y searchQuery se añaden por si se implementa filtrado backend

  // Cargar datos iniciales y cuando cambien las dependencias de paginación/filtrado
  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage, filterStatus, searchQuery]); // Se quita fetchData de aquí para evitar bucle si no se usa bien useCallback

  // ELIMINAMOS LÓGICA DE FILTRADO FRONTEND Y PAGINACIÓN SLICE
  // const applyFilters = useCallback(...);
  // const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  // useEffect(() => { /* setFilteredTickets(applyFilters()) */ }, [applyFilters]);
  
  // currentTickets ahora es simplemente 'tickets' (los de la página actual)
  const currentTickets = tickets;
  
  // Índices para paginación (para el mensaje "Mostrando X a Y de Z")
  // Estos se pueden calcular o obtener del componente Pagination si se le pasan totalItems e itemsPerPage
  const indexOfFirstTicket = totalItems > 0 ? (currentPage - 1) * ticketsPerPage + 1 : 0;
  const indexOfLastTicket = totalItems > 0 ? Math.min(currentPage * ticketsPerPage, totalItems) : 0;
  
  // Navegación entre páginas
  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber); // Esto dispara el useEffect que llama a fetchData
      const ticketsTable = document.querySelector('.tickets-table'); // Asumiendo que la tabla tiene esta clase
      if (ticketsTable) {
        ticketsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentPage]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Manejar selección de boletos
  const toggleTicketSelection = (ticketNumber: string) => {
    setSelectedTickets((prevSelected) => {
      if (prevSelected.includes(ticketNumber)) {
        return prevSelected.filter((num) => num !== ticketNumber);
      } else {
        return [...prevSelected, ticketNumber];
      }
    });
  };
  
  // Seleccionar/deseleccionar todos los boletos
  const selectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTickets(currentTickets.map(t => t.number));
    } else {
      setSelectedTickets([]);
    }
  };

  // Cambiar estado de boletos seleccionados
  const updateTicketsStatus = async (status: TicketStatus, ticketNumbers?: string[]) => {
    if (!raffleId) return;
    
    // Usar los números de boletos proporcionados o los seleccionados
    const numbersToUpdate = ticketNumbers || selectedTickets;
    
    if (numbersToUpdate.length === 0) return;
    
    try {
      const result = await TicketService.updateMultipleTicketsStatus(
        raffleId,
        numbersToUpdate,
        status
      );
      
      if (result.success) {
        // Recargar datos de la página actual para reflejar los cambios
        fetchData(currentPage);
        // setSelectedTickets([]); // Limpiar selección después de la acción
        NotificationService.success(`${result.modifiedCount} boletos actualizados a: ${status}`);
      } else {
        // Esto podría necesitar un manejo más específico si el backend devuelve success:false
        NotificationService.error('No se pudieron actualizar todos los boletos.');
      }
    } catch (err: any) {
      console.error('Error al actualizar estado de boletos:', err);
      NotificationService.error(err.response?.data?.message || 'Error al actualizar los boletos.');
    }
  };

  // Completar venta de boletos seleccionados
  const completeSale = async () => {
    if (!raffleId || selectedTickets.length === 0 || !buyerInfo.name) {
      NotificationService.warning('Selecciona boletos e ingresa el nombre del comprador.');
      return;
    }
    
    try {
      const result = await TicketService.completeSale(
        raffleId,
        selectedTickets,
        buyerInfo
      );
      
      if (result.success) {
        // Recargar datos de la página actual
        fetchData(currentPage);
        // setSelectedTickets([]); // Limpiar selección
        setShowSaleModal(false);
        setBuyerInfo({
          name: '',
          email: '',
          phone: '',
          transactionId: '',
        });
        NotificationService.success(`${result.modifiedCount} boletos vendidos a ${buyerInfo.name}`);
      } else {
        NotificationService.error('No se pudieron vender todos los boletos seleccionados.');
      }
    } catch (err: any) {
      console.error('Error al completar la venta:', err);
      NotificationService.error(err.response?.data?.message || 'Error al procesar la venta.');
    }
  };

  // Mostrar modal para completar venta
  const openSaleModal = (ticketNumbers?: string[]) => {
    // Si se proporcionan números específicos, los usamos
    if (ticketNumbers && ticketNumbers.length > 0) {
      setSelectedTickets(ticketNumbers);
      setShowSaleModal(true);
      return;
    }
    
    // Si no, verificamos que haya boletos seleccionados
    if (selectedTickets.length === 0) {
      alert('Por favor selecciona al menos un boleto para vender');
      return;
    }
    setShowSaleModal(true);
  };
  
  // Cerrar modal de venta
  const closeSaleModal = () => {
    setShowSaleModal(false);
  };

  return {
    // Estado
    raffle,
    tickets,
    loading,
    error,
    filterStatus,
    searchQuery,
    currentPage,
    selectedTickets,
    currentTickets,
    totalPages,
    totalItems,
    ticketsPerPage,
    buyerInfo,
    showSaleModal,
    debugInfo,
    
    // Índices para paginación
    indexOfFirstTicket,
    indexOfLastTicket,
    
    // Métodos
    setFilterStatus,
    setSearchQuery,
    toggleTicketSelection,
    selectAll,
    updateTicketsStatus,
    completeSale,
    openSaleModal,
    closeSaleModal,
    setBuyerInfo,
    paginate,
    nextPage,
    prevPage,
    fetchData, // Exponemos este método para poder recargar datos manualmente
  };
};
