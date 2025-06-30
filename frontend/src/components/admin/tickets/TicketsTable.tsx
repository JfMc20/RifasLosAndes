import React, { useEffect, useState } from 'react';
import { Ticket, TicketStatus } from '../../../types';
import { TicketService } from '../../../services/ticket.service';
import ActionButtons from '../common/ActionButtons';

interface TicketsTableProps {
  raffleId: string;
  tickets: Ticket[];
  selectedTickets: string[];
  toggleTicketSelection: (ticketNumber: string) => void;
  selectAll: (selected: boolean) => void;
  highlightTicket?: string;
  updateTicketsStatus: (status: TicketStatus, ticketNumbers?: string[]) => void;
  openSaleModal: (ticketNumbers?: string[]) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({
  raffleId,
  tickets,
  selectedTickets,
  toggleTicketSelection,
  selectAll,
  highlightTicket,
  updateTicketsStatus,
  openSaleModal
}) => {
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const handleDownload = async (ticketNumber: string) => {
    if (!raffleId) return;
    setLoadingPdf(ticketNumber);
    try {
      await TicketService.downloadTicketPdf(raffleId, ticketNumber);
    } catch (error) {
      console.error('Failed to download PDF', error);
      // TODO: Implement user-facing error notification
    } finally {
      setLoadingPdf(null);
    }
  };
  
  useEffect(() => {
    if (highlightTicket) {
      const ticketElement = document.getElementById(`ticket-${highlightTicket}`);
      if (ticketElement) {
        ticketElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ticketElement.classList.add('highlight-animation');
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-ui-text-secondary uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-ui-surface divide-y divide-ui-border">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-ui-text-secondary">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {ticket.status === TicketStatus.SOLD && (
                    <button
                      onClick={() => handleDownload(ticket.number)}
                      disabled={loadingPdf === ticket.number}
                      className="text-brand-accent hover:text-brand-accent-dark disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Descargar PDF"
                    >
                      {loadingPdf === ticket.number ? (
                        <svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                    </button>
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
