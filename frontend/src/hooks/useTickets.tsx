import { useState, useEffect, useCallback } from 'react';
import { Raffle, Ticket, TicketStatus } from '../types';
import { RaffleService } from '../services/raffle.service';
import { TicketService } from '../services/ticket.service';

export interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
  transactionId: string;
}

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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Estados para manejo de tickets
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(100);
  
  // Estados para venta
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: '',
    email: '',
    phone: '',
    transactionId: '',
  });
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Función para cargar datos - extraída para poder reutilizarla
  const fetchData = useCallback(async () => {
    if (!raffleId) {
      setError('No se proporcionó ID de rifa válido');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Cargando datos para raffleId:', raffleId);
      
      // Obtener datos de la rifa
      const raffleData = await RaffleService.getRaffle(raffleId);
      setRaffle(raffleData);
      console.log('Datos de rifa cargados:', raffleData);
      
      // Obtener todos los boletos de la rifa
      const ticketData = await TicketService.getAllTickets(raffleId);
      setTickets(ticketData);
      console.log(`Cargados ${ticketData.length} boletos`);
      
      // Guardar información de depuración
      setDebugInfo({
        raffleId,
        ticketCount: ticketData.length,
        statusCount: {
          disponibles: ticketData.filter(t => t.status === TicketStatus.AVAILABLE).length,
          reservados: ticketData.filter(t => t.status === TicketStatus.RESERVED).length,
          vendidos: ticketData.filter(t => t.status === TicketStatus.SOLD).length,
        }
      });
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading tickets data:', err);
      setError(err.message || 'Error al cargar los datos de boletos');
      setLoading(false);
      setDebugInfo({ error: err.toString() });
    }
  }, [raffleId]);

  // Cargar datos iniciales de la rifa y sus boletos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aplicar filtros a los tickets
  const applyFilters = useCallback(() => {
    console.log(`Aplicando filtros: estado=${filterStatus}, búsqueda="${searchQuery}", total tickets=${tickets.length}`);
    
    return tickets.filter(ticket => {
      // Si no hay ticket, no incluirlo
      if (!ticket) return false;
      
      // Primero aplicamos el filtro por estado
      if (filterStatus !== 'all' && ticket.status !== filterStatus) {
        return false;
      }
      
      // Si no hay consulta de búsqueda, incluimos todos los que pasaron el filtro por estado
      if (!searchQuery || searchQuery.trim() === '') {
        return true;
      }
      
      // Convertir la búsqueda a minúsculas para comparación insensible a mayúsculas
      const query = searchQuery.trim().toLowerCase();
      
      // Búsqueda exacta por número de boleto (prioridad alta)
      if (ticket.number === searchQuery.trim()) {
        return true;
      }
      
      // Búsqueda por coincidencia parcial en número de boleto
      if (ticket.number && ticket.number.includes(query)) {
        return true;
      }
      
      // Buscar en campos relacionados con el comprador si existen
      if (ticket.buyerName && ticket.buyerName.toLowerCase().includes(query)) {
        return true;
      }
      
      if (ticket.buyerEmail && ticket.buyerEmail.toLowerCase().includes(query)) {
        return true;
      }
      
      if (ticket.buyerPhone && ticket.buyerPhone.toLowerCase().includes(query)) {
        return true;
      }
      
      if (ticket.transactionId && ticket.transactionId.toLowerCase().includes(query)) {
        return true;
      }
      
      // Si no coincide con ningún criterio de búsqueda, no lo incluimos
      return false;
    });
  }, [tickets, filterStatus, searchQuery]);
  
  // Aplicar filtros y obtener los tickets
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  
  useEffect(() => {
    const filtered = applyFilters();
    setFilteredTickets(filtered);
  }, [applyFilters]);
  
  // Los tickets que se muestran actualmente (con paginación)
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  
  // Total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ticketsPerPage));
  
  // Depuración
  useEffect(() => {
    console.log(`Filtrado resultó en ${filteredTickets.length} boletos, mostrando página ${currentPage} de ${totalPages}`);
    console.log(`Mostrando boletos ${indexOfFirstTicket+1}-${Math.min(indexOfLastTicket, filteredTickets.length)} de ${filteredTickets.length}`);
  }, [filteredTickets.length, currentPage, totalPages, indexOfFirstTicket, indexOfLastTicket]);
  
  // Navegación entre páginas
  const paginate = useCallback((pageNumber: number) => {
    console.log('Cambiando a página:', pageNumber);
    setCurrentPage(pageNumber);
    // Scroll al inicio de la tabla
    const ticketsTable = document.querySelector('.tickets-table');
    if (ticketsTable) {
      ticketsTable.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  }, [currentPage, totalPages, paginate]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  }, [currentPage, paginate]);

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
        // Actualizar la lista de boletos
        setTickets((prevTickets) =>
          prevTickets.map((ticket) => {
            // Si el ticket está en la lista de actualizados
            if (numbersToUpdate.includes(ticket.number)) {
              // Si el nuevo estado es AVAILABLE, SIEMPRE limpiar datos del comprador
              // independientemente del estado anterior (vendido o reservado)
              if (status === TicketStatus.AVAILABLE) {
                return {
                  ...ticket,
                  status,
                  buyerName: undefined,
                  buyerEmail: undefined,
                  buyerPhone: undefined,
                  transactionId: undefined
                };
              } else {
                // Para otros cambios de estado, solo actualizar el estado
                return { ...ticket, status };
              }
            } else {
              // No modificar tickets que no están en la lista
              return ticket;
            }
          })
        );
        
        // Solo limpiar los tickets seleccionados si no se especificaron números
        if (!ticketNumbers) {
          setSelectedTickets([]);
        }
        alert(`${result.modifiedCount} boletos actualizados al estado: ${status}`);
      }
    } catch (err) {
      console.error('Error al actualizar estado de boletos:', err);
      alert('Error al actualizar los boletos. Por favor, intenta nuevamente.');
    }
  };

  // Completar venta de boletos seleccionados
  const completeSale = async () => {
    if (!raffleId || selectedTickets.length === 0 || !buyerInfo.name) return;
    
    try {
      const result = await TicketService.completeSale(
        raffleId,
        selectedTickets,
        buyerInfo
      );
      
      if (result.success) {
        // Actualizar la lista de boletos
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            selectedTickets.includes(ticket.number)
              ? {
                  ...ticket,
                  status: TicketStatus.SOLD,
                  buyerName: buyerInfo.name,
                  buyerEmail: buyerInfo.email,
                  buyerPhone: buyerInfo.phone,
                  transactionId: buyerInfo.transactionId,
                }
              : ticket
          )
        );
        
        setSelectedTickets([]);
        setShowSaleModal(false);
        setBuyerInfo({
          name: '',
          email: '',
          phone: '',
          transactionId: '',
        });
        
        alert(`${result.modifiedCount} boletos vendidos a ${buyerInfo.name}`);
      }
    } catch (err) {
      console.error('Error al completar la venta:', err);
      alert('Error al procesar la venta. Por favor, intenta nuevamente.');
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
