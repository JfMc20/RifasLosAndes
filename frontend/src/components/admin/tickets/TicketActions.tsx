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
    <div className="bg-gray-100 shadow rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateTicketsStatus(TicketStatus.AVAILABLE)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Marcar como Disponibles
        </button>
        <button
          onClick={() => updateTicketsStatus(TicketStatus.RESERVED)}
          className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Marcar como Reservados
        </button>
        <button
          onClick={openSaleModal}
          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Completar Venta
        </button>
      </div>
    </div>
  );
};

export default TicketActions;
