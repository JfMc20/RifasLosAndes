import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../../types';

interface TicketFinderProps {
  tickets: Ticket[];
  onTicketFound: (ticket: Ticket | null) => void;
}

const TicketFinder: React.FC<TicketFinderProps> = ({ tickets, onTicketFound }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    ticket: Ticket | null;
    message: string;
  }>({
    found: false,
    ticket: null,
    message: '',
  });

  const handleSearch = () => {
    if (!ticketNumber.trim()) {
      setSearchResult({
        found: false,
        ticket: null,
        message: 'Por favor ingrese un número de boleto',
      });
      onTicketFound(null);
      return;
    }

    // Formato para búsqueda - usando 3 dígitos en lugar de 4
    const formattedNumber = ticketNumber.padStart(3, '0');
    
    // Buscar el boleto
    const foundTicket = tickets.find((ticket) => ticket.number === formattedNumber);
    
    if (foundTicket) {
      setSearchResult({
        found: true,
        ticket: foundTicket,
        message: `Boleto #${foundTicket.number} encontrado. Estado: ${getStatusText(foundTicket.status)}`,
      });
      onTicketFound(foundTicket);
    } else {
      setSearchResult({
        found: false,
        ticket: null,
        message: `No se encontró el boleto #${formattedNumber}`,
      });
      onTicketFound(null);
    }
  };

  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.AVAILABLE:
        return 'Disponible';
      case TicketStatus.RESERVED:
        return 'Reservado';
      case TicketStatus.SOLD:
        return 'Vendido';
      default:
        return 'Desconocido';
    }
  };

  const getStatusClass = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.AVAILABLE:
        return 'text-green-600';
      case TicketStatus.RESERVED:
        return 'text-yellow-600';
      case TicketStatus.SOLD:
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-medium mb-4">Buscar Boleto Específico</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          placeholder="Ingrese número de boleto"
          className="flex-grow px-4 py-2 border rounded-md"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>
      
      {searchResult.message && (
        <div className={`mt-3 p-3 rounded-md ${searchResult.found ? 'bg-green-50' : 'bg-red-50'}`}>
          {searchResult.ticket ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Boleto #{searchResult.ticket.number}</p>
                <p className={`${getStatusClass(searchResult.ticket.status)}`}>
                  Estado: {getStatusText(searchResult.ticket.status)}
                </p>
                {searchResult.ticket.buyerName && (
                  <p>Comprador: {searchResult.ticket.buyerName}</p>
                )}
              </div>
              <button
                onClick={() => {
                  const ticketElement = document.getElementById(`ticket-${searchResult.ticket?.number}`);
                  if (ticketElement) {
                    ticketElement.scrollIntoView({ behavior: 'smooth' });
                    ticketElement.classList.add('highlight-ticket');
                    setTimeout(() => {
                      ticketElement.classList.remove('highlight-ticket');
                    }, 3000);
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Ir al boleto
              </button>
            </div>
          ) : (
            <p>{searchResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketFinder;
