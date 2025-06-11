import React from 'react';
import { TicketStatus } from '../../../types';

interface TicketFiltersProps {
  filterStatus: TicketStatus | 'all';
  setFilterStatus: (status: TicketStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCount: number;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  selectedCount
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value={TicketStatus.AVAILABLE}>Disponibles</option>
            <option value={TicketStatus.RESERVED}>Reservados</option>
            <option value={TicketStatus.SOLD}>Vendidos</option>
          </select>
        </div>
        
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Boleto o Comprador
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Número de boleto, nombre, email..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
        
        {/* Contador de seleccionados */}
        <div className="flex items-end justify-end">
          <p className="text-sm font-medium text-gray-700">
            {selectedCount} boletos seleccionados
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
