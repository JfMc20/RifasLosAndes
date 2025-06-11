import React from 'react';
import { Ticket, TicketStatus } from '../../../types';

interface TicketProgressBarProps {
  tickets: Ticket[];
  totalTickets: number;
}

const TicketProgressBar: React.FC<TicketProgressBarProps> = ({ tickets, totalTickets }) => {
  // Calcular estadísticas
  const soldCount = tickets.filter(ticket => ticket.status === TicketStatus.SOLD).length;
  const reservedCount = tickets.filter(ticket => ticket.status === TicketStatus.RESERVED).length;
  const availableCount = tickets.filter(ticket => ticket.status === TicketStatus.AVAILABLE).length;

  // Calcular porcentajes
  const soldPercentage = (soldCount / totalTickets) * 100;
  const reservedPercentage = (reservedCount / totalTickets) * 100;
  const availablePercentage = (availableCount / totalTickets) * 100;

  return (
    <div className="mb-8 p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-medium mb-3">Progreso de Ventas</h3>
      
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium">
          {soldCount} de {totalTickets} boletos vendidos ({soldPercentage.toFixed(1)}%)
        </span>
        <span className="text-sm text-gray-600">
          Meta: {totalTickets} boletos
        </span>
      </div>
      
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 flex items-center justify-center text-xs text-white"
          style={{ width: `${soldPercentage}%` }}
        >
          {soldPercentage > 5 ? `${soldPercentage.toFixed(1)}%` : ''}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-green-600 font-bold">{soldCount}</div>
          <div className="text-xs">Vendidos</div>
          <div className="mt-1 w-full h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="text-yellow-600 font-bold">{reservedCount}</div>
          <div className="text-xs">Reservados</div>
          <div className="mt-1 w-full h-2 bg-yellow-500 rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="text-gray-600 font-bold">{availableCount}</div>
          <div className="text-xs">Disponibles</div>
          <div className="mt-1 w-full h-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        {soldPercentage < 25 && (
          <p>La venta de boletos está iniciando. ¡Promueve tu rifa para incrementar las ventas!</p>
        )}
        {soldPercentage >= 25 && soldPercentage < 50 && (
          <p>¡Buen progreso! Ya has vendido un cuarto de los boletos disponibles.</p>
        )}
        {soldPercentage >= 50 && soldPercentage < 75 && (
          <p>¡Excelente! Has superado la mitad de los boletos. Sigue así.</p>
        )}
        {soldPercentage >= 75 && soldPercentage < 100 && (
          <p>¡Casi completo! Sólo faltan {totalTickets - soldCount} boletos para completar tu meta.</p>
        )}
        {soldPercentage >= 100 && (
          <p className="font-medium text-green-600">¡Felicidades! Has vendido todos los boletos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default TicketProgressBar;
