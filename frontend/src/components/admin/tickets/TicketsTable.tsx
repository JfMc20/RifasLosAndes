import React, { useEffect } from 'react';
import { Ticket, TicketStatus } from '../../../types';
import ActionButtons from '../common/ActionButtons';

interface TicketsTableProps {
  tickets: Ticket[];
  selectedTickets: string[];
  toggleTicketSelection: (ticketNumber: string) => void;
  selectAll: (selected: boolean) => void;
  highlightTicket?: string;
  updateTicketsStatus: (status: TicketStatus, ticketNumbers?: string[]) => void;
  openSaleModal: (ticketNumbers?: string[]) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  selectedTickets,
  toggleTicketSelection,
  selectAll,
  highlightTicket,
  updateTicketsStatus,
  openSaleModal
}) => {
  
  // Efecto para aplicar la animación de resaltado cuando cambia el boleto seleccionado
  useEffect(() => {
    if (highlightTicket) {
      const ticketElement = document.getElementById(`ticket-${highlightTicket}`);
      if (ticketElement) {
        // Hacer scroll al elemento y resaltarlo
        ticketElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ticketElement.classList.add('highlight-animation');
        
        // Eliminar la clase después de la animación
        setTimeout(() => {
          ticketElement.classList.remove('highlight-animation');
        }, 3000);
      }
    }
  }, [highlightTicket]);
  return (
    <div className="overflow-x-auto">
      <style jsx global>{`
        .highlight-animation {
          animation: highlight 3s ease-in-out;
        }
        
        @keyframes highlight {
          0% { background-color: rgba(230, 239, 255, 0.5); }
          50% { background-color: rgba(230, 239, 255, 0.8); }
          100% { background-color: transparent; }
        }
      `}</style>
      <table className="min-w-full divide-y divide-ui-border">
        <thead className="bg-ui-background">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              <input
                type="checkbox"
                onChange={(e) => selectAll(e.target.checked)}
                checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                className="h-4 w-4 rounded border-ui-border text-brand-accent focus:ring-brand-accent"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Número
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Comprador
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Contacto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Transacción
            </th>
          </tr>
        </thead>
        <tbody className="bg-ui-surface divide-y divide-ui-border">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-ui-text-secondary">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-ui-text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">No se encontraron boletos</span>
                  <span className="text-sm">Intenta ajustar los filtros de búsqueda.</span>
                </div>
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr 
                key={ticket.number} 
                id={`ticket-${ticket.number}`}
                className={`transition-colors duration-200 hover:bg-ui-background ${selectedTickets.includes(ticket.number) ? "bg-brand-primary-light" : ""}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.number)}
                    onChange={() => toggleTicketSelection(ticket.number)}
                    className="h-4 w-4 rounded border-ui-border text-brand-accent focus:ring-brand-accent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-ui-text-primary">{ticket.number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    ticket.status === TicketStatus.AVAILABLE
                      ? 'bg-gray-100 text-gray-800'
                      : ticket.status === TicketStatus.RESERVED
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-ui-text-primary">
                    {ticket.buyerName || <span className="text-ui-text-secondary">-</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-ui-text-secondary">
                    {ticket.buyerEmail && (
                      <div>{ticket.buyerEmail}</div>
                    )}
                    {ticket.buyerPhone && (
                      <div>{ticket.buyerPhone}</div>
                    )}
                    {!ticket.buyerEmail && !ticket.buyerPhone && '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-ui-text-secondary">
                    {ticket.transactionId || '-'}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;
