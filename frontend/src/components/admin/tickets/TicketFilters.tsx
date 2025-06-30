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
    <div className="mb-6 pb-6 border-b border-ui-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Filtro por estado */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-bold text-ui-text-secondary mb-2">
            Filtrar por Estado
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
            className="block w-full text-sm rounded-lg border-ui-border bg-ui-input text-ui-text-primary focus:ring-brand-accent focus:border-brand-accent transition duration-200"
          >
            <option value="all">Todos los estados</option>
            <option value={TicketStatus.AVAILABLE}>Disponibles</option>
            <option value={TicketStatus.RESERVED}>Reservados</option>
            <option value={TicketStatus.SOLD}>Vendidos</option>
          </select>
        </div>
        
        {/* Búsqueda */}
        <div>
          <label htmlFor="search-filter" className="block text-sm font-bold text-ui-text-secondary mb-2">
            Buscar Boleto o Comprador
          </label>
          <input
            id="search-filter"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Número, nombre, email..."
            className="block w-full text-sm rounded-lg border-ui-border bg-ui-input text-ui-text-primary focus:ring-brand-accent focus:border-brand-accent transition duration-200"
          />
        </div>
        
        {/* Contador de seleccionados */}
        <div className="text-right">
          <p className="text-sm font-bold text-ui-text-primary bg-brand-primary-light text-brand-primary px-4 py-2 rounded-lg inline-block">
            {selectedCount} {selectedCount === 1 ? 'boleto seleccionado' : 'boletos seleccionados'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
