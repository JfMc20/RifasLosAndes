import React from 'react';

interface TicketPaginationProps {
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  ticketsPerPage: number;
  indexOfFirstTicket: number;
  indexOfLastTicket: number;
  paginate: (pageNumber: number) => void;
  prevPage: () => void;
  nextPage: () => void;
}

const TicketPagination: React.FC<TicketPaginationProps> = ({
  currentPage,
  totalPages,
  totalTickets,
  ticketsPerPage,
  indexOfFirstTicket,
  indexOfLastTicket,
  paginate,
  prevPage,
  nextPage
}) => {
  // Mostrar siempre la paginación si hay más de una página
  if (totalPages <= 1) return null;
  
  return (
    <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-center border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{indexOfFirstTicket + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(indexOfFirstTicket + ticketsPerPage, totalTickets)}
            </span>{' '}
            de <span className="font-medium">{totalTickets}</span> boletos
          </p>
        </div>
        <div className="flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-md" aria-label="Paginación">
            {/* Botón Anterior */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
            >
              <span className="sr-only">Anterior</span>
              <span>&larr; Anterior</span>
            </button>
            
            {/* Mostrar números de página */}
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              // Lógica para mostrar páginas cercanas a la página actual
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Botón Siguiente */}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
            >
              <span>Siguiente &rarr;</span>
              <span className="sr-only">Siguiente</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TicketPagination;
