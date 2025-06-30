import React from 'react';
import Link from 'next/link';

interface QuickActionsProps {
  raffleId: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ raffleId }) => {
  return (
    <div className="bg-ui-surface shadow-lg rounded-xl p-6 border border-ui-border">
      <h3 className="text-xl font-bold text-ui-text-primary mb-4">Acciones Rápidas</h3>
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/raffles/${raffleId}/edit`} 
          className="flex items-center justify-center px-5 py-3 bg-brand-secondary text-white rounded-lg font-bold hover:bg-brand-secondary-dark transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Editar Rifa
        </Link>
        <Link 
          href={`/admin/raffles/${raffleId}/tickets`} 
          className="flex items-center justify-center px-5 py-3 bg-brand-accent text-brand-primary rounded-lg font-bold hover:bg-brand-accent-dark transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          Gestionar Boletos
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
