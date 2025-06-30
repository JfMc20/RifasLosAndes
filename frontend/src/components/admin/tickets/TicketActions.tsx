import React from 'react';
import { TicketStatus } from '../../../types';

interface TicketActionsProps {
  selectedTickets: string[];
  updateTicketsStatus: (status: TicketStatus) => void;
  openSaleModal: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({
  selectedTickets,
  updateTicketsStatus,
  openSaleModal
}) => {
  if (selectedTickets.length === 0) return null;

  return (
    <div className="bg-brand-primary-light border border-brand-accent rounded-lg p-4 mb-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-bold text-brand-primary">Acciones para {selectedTickets.length} boletos:</span>
        <button
          onClick={() => updateTicketsStatus(TicketStatus.AVAILABLE)}
          className="px-4 py-2 text-sm font-semibold text-ui-text-primary bg-ui-surface border border-ui-border rounded-lg hover:bg-ui-background transition-colors duration-200"
        >
          Marcar Disponibles
        </button>
        <button
          onClick={() => updateTicketsStatus(TicketStatus.RESERVED)}
          className="px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors duration-200"
        >
          Marcar Reservados
        </button>
        <button
          onClick={openSaleModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-opacity-90 transition-colors duration-200 shadow-sm"
        >
          Completar Venta
        </button>
      </div>
    </div>
  );
};

export default TicketActions;
