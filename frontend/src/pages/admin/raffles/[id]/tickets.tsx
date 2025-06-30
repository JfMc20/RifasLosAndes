import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/admin/Layout';
import { AuthService } from '../../../../services/auth.service';
import { useTickets } from '../../../../hooks/useTickets';

// Componentes modulares
import TicketFilters from '../../../../components/admin/tickets/TicketFilters';
import TicketActions from '../../../../components/admin/tickets/TicketActions';
import TicketsTable from '../../../../components/admin/tickets/TicketsTable';
// import TicketPagination from '../../../../components/admin/tickets/TicketPagination'; // Reemplazado
import Pagination from '../../../../components/admin/common/Pagination'; // Usar el genérico
import SaleModal from '../../../../components/admin/tickets/SaleModal';

const TicketsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const raffleId = typeof id === 'string' ? id : undefined;
  
  const {
    // Estado
    raffle,
    loading,
    error,
    selectedTickets,
    currentTickets,
    filterStatus,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    ticketsPerPage,
    buyerInfo,
    showSaleModal,
    
    // Índices para paginación
    indexOfFirstTicket,
    indexOfLastTicket,
    
    // Métodos
    setFilterStatus,
    setSearchQuery,
    toggleTicketSelection,
    selectAll,
    updateTicketsStatus,
    completeSale,
    openSaleModal,
    closeSaleModal,
    setBuyerInfo,
    paginate,
    nextPage,
    prevPage,
  } = useTickets(raffleId);

  // Verificar autenticación
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>{raffle ? `Administrar Boletos - ${raffle.name}` : 'Administrar Boletos'}</title>
      </Head>
      
      <AdminLayout title={raffle ? `Boletos de: ${raffle.name}` : 'Administrar Boletos'}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ui-text-primary">Gestión de Boletos</h1>
            <p className="text-ui-text-secondary mt-1">{raffle ? `Rifa: ${raffle.name}` : ''}</p>
          </div>
          <button
            onClick={() => router.push(`/admin/raffles/${id}`)}
            className="px-5 py-3 border border-ui-border shadow-sm text-sm font-bold rounded-lg text-ui-text-primary bg-ui-surface hover:bg-ui-background focus:outline-none transition-all duration-200"
          >
            Volver a la Rifa
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && raffle && (
          <div className="bg-ui-surface rounded-xl shadow-lg border border-ui-border p-6">
            
            {/* Filtros */}
            <TicketFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCount={selectedTickets.length}
            />
            
            {/* Acciones para boletos seleccionados */}
            <TicketActions
              selectedTickets={selectedTickets}
              updateTicketsStatus={updateTicketsStatus}
              openSaleModal={openSaleModal}
            />
            
            {/* Tabla de boletos */}
            <TicketsTable 
              raffleId={raffleId}
              tickets={currentTickets} 
              selectedTickets={selectedTickets}
              toggleTicketSelection={toggleTicketSelection}
              selectAll={selectAll}
              updateTicketsStatus={async () => {}}
              openSaleModal={() => {}}
            />
            
            {/* Paginación */}
            { totalPages > 0 && currentTickets.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
                totalItems={totalItems} // Prop directamente del hook useTickets
                itemsPerPage={ticketsPerPage} // Prop directamente del hook useTickets
                itemName="boletos"
              />
            )}
            
            {/* Modal para completar venta */}
            <SaleModal
              show={showSaleModal}
              selectedTickets={selectedTickets}
              buyerInfo={buyerInfo}
              setBuyerInfo={setBuyerInfo}
              onClose={closeSaleModal}
              onComplete={completeSale}
            />
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default TicketsPage;
