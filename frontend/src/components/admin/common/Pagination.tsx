import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'resultados',
}) => {
  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página o menos
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Máximo de botones de página a mostrar (sin incluir prev/next/ellipsis)
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) { // Mostrar todos los números si son pocos
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica para mostrar "..."
      pageNumbers.push(1); // Siempre mostrar la primera página

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage - halfPagesToShow <= 2) {
        endPage = Math.min(totalPages - 1, maxPagesToShow);
      }

      if (currentPage + halfPagesToShow >= totalPages - 1) {
        startPage = Math.max(2, totalPages - maxPagesToShow +1);
      }

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages); // Siempre mostrar la última página
    }
    return pageNumbers;
  };

  const pageNumbersToRender = getPageNumbers();

  const indexOfFirstItem = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const indexOfLastItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;


  return (
    <div className="pt-6 mt-6 border-t border-ui-border flex flex-col sm:flex-row items-center justify-between w-full">
      {totalItems && itemsPerPage && (
         <div className="mb-4 sm:mb-0">
          <p className="text-sm text-ui-text-secondary">
            Mostrando{' '}
            <span className="font-bold text-ui-text-primary">{indexOfFirstItem}</span> a{' '}
            <span className="font-bold text-ui-text-primary">{indexOfLastItem}</span> de{' '}
            <span className="font-bold text-ui-text-primary">{totalItems}</span> {itemName}
          </p>
        </div>
      )}
      <nav className="inline-flex items-center space-x-1" aria-label="Paginación">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            currentPage === 1
              ? 'bg-ui-background text-ui-text-secondary cursor-not-allowed'
              : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
          }`}
        >
          Anterior
        </button>

        {pageNumbersToRender.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                currentPage === page
                  ? 'bg-brand-primary text-white border border-brand-primary shadow-md'
                  : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-sm text-ui-text-secondary">
              ...
            </span>
          )
        )}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            currentPage === totalPages
              ? 'bg-ui-background text-ui-text-secondary cursor-not-allowed'
              : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
          }`}
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
