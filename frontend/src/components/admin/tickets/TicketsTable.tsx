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
    <div className="bg-white shadow overflow-hidden rounded-lg tickets-table">
      <style jsx global>{`
        .highlight-animation {
          animation: highlight 3s ease-in-out;
        }
        
        @keyframes highlight {
          0% { background-color: rgba(59, 130, 246, 0.1); }
          50% { background-color: rgba(59, 130, 246, 0.3); }
          100% { background-color: transparent; }
        }
      `}</style>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                onChange={(e) => selectAll(e.target.checked)}
                checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comprador
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transacción
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No hay boletos que coincidan con los filtros
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr 
                key={ticket.number} 
                id={`ticket-${ticket.number}`}
                className={`transition-colors ${highlightTicket === ticket.number ? 'highlight-animation' : ''} ${selectedTickets.includes(ticket.number) ? "bg-blue-50" : ""}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.number)}
                    onChange={() => toggleTicketSelection(ticket.number)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ticket.number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ticket.status === TicketStatus.AVAILABLE
                      ? 'bg-blue-100 text-blue-800'
                      : ticket.status === TicketStatus.RESERVED
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === TicketStatus.AVAILABLE
                      ? 'Disponible'
                      : ticket.status === TicketStatus.RESERVED
                      ? 'Reservado'
                      : 'Vendido'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ticket.buyerName || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {ticket.buyerEmail && (
                      <div>Email: {ticket.buyerEmail}</div>
                    )}
                    {ticket.buyerPhone && (
                      <div>Tel: {ticket.buyerPhone}</div>
                    )}
                    {!ticket.buyerEmail && !ticket.buyerPhone && '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {ticket.transactionId || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {selectedTickets.includes(ticket.number) && (
                    <ActionButtons 
                      actions={[
                        {
                          label: "Disponible",
                          color: "blue",
                          onClick: () => updateTicketsStatus(TicketStatus.AVAILABLE, [ticket.number])
                        },
                        {
                          label: "Reservar",
                          color: "yellow",
                          onClick: () => updateTicketsStatus(TicketStatus.RESERVED, [ticket.number])
                        },
                        {
                          label: "Vender",
                          color: "green",
                          onClick: () => openSaleModal([ticket.number])
                        }
                      ]}
                    />
                  )}
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
