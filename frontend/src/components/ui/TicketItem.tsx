import React from 'react';
import { Ticket, TicketStatus } from '@/types';

interface TicketItemProps {
  number: string;
  status: Ticket['status'];
  onSelect: (number: string) => void;
  highlight?: boolean;
}

const TicketItem: React.FC<TicketItemProps> = ({ number, status, onSelect, highlight = false }) => {
  const handleClick = () => {
    if (status === TicketStatus.AVAILABLE || status === TicketStatus.SELECTED) {
      onSelect(number);
    }
  };

  // Determine styles based on ticket status
  const getStyles = () => {
    // Base para el resaltado
    const highlightStyles = highlight ? 'animate-pulse shadow-md' : '';
    
    switch (status) {
      case TicketStatus.AVAILABLE:
        return `bg-white hover:bg-gray-50 cursor-pointer border-2 border-gray-200 hover:border-yellow-500 hover:shadow-sm ${highlight ? 'border-yellow-500' : ''}`;
      case TicketStatus.SELECTED:
        return `bg-yellow-500 text-white hover:bg-yellow-400 cursor-pointer border-2 border-yellow-600 shadow-md ${highlightStyles}`;
      case TicketStatus.RESERVED:
        return `bg-red-600 text-white cursor-not-allowed opacity-90 border-2 border-red-700 shadow-sm ${highlightStyles}`;
      case TicketStatus.SOLD:
        return `bg-green-600 text-white cursor-not-allowed opacity-90 border-2 border-green-700 shadow-sm ${highlightStyles}`;
      default:
        return `bg-white border-2 border-gray-200 ${highlightStyles}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        border rounded-md p-1.5 w-14 h-14 
        flex items-center justify-center text-base font-bold 
        transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
        relative z-10 
        ${getStyles()}
      `}
      title={`Número ${number} - ${status === TicketStatus.AVAILABLE ? 'Disponible' : 
             status === TicketStatus.SELECTED ? 'Seleccionado' : 
             status === TicketStatus.RESERVED ? 'Reservado' : 'Vendido'}`}
    >
      {number}
    </div>
  );
};

export default TicketItem;
