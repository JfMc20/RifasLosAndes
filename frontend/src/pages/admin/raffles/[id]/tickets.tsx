import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/admin/Layout';
import { AuthService } from '../../../../services/auth.service';
import { useTickets } from '../../../../hooks/useTickets';
import { Ticket } from '../../../../types';

// Componentes modulares
import TicketFilters from '../../../../components/admin/tickets/TicketFilters';
import TicketsTable from '../../../../components/admin/tickets/TicketsTable';
import TicketPagination from '../../../../components/admin/tickets/TicketPagination';
import SaleModal from '../../../../components/admin/tickets/SaleModal';
import TicketProgressBar from '../../../../components/admin/tickets/TicketProgressBar';

const TicketsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const raffleId = typeof id === 'string' ? id : undefined;
  
  // El estado foundTicket ya no se usa al eliminar TicketFinder
  
  const {
    // Estado
    raffle,
    loading,
    error,
    selectedTickets,
    currentTickets,
    tickets,
    filterStatus,
    searchQuery,
    currentPage,
    totalPages,
    buyerInfo,
    showSaleModal,
    debugInfo,
    fetchData,
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

  // Ya no necesitamos estas definiciones, las propiedades vienen del hook useTickets

  return (
    <>
      <Head>
        <title>{raffle ? `Administrar Boletos - ${raffle.name}` : 'Administrar Boletos'}</title>
      </Head>
      
      <AdminLayout title="Administración de Boletos">
        {/* Se ha eliminado el panel de diagnóstico para producción */}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
              <p className="mt-2 text-gray-600">Cargando boletos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">{raffle?.name} - Administrar Boletos</h1>
              <button
                onClick={() => router.push(`/admin/raffles/${id}`)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Volver a la Rifa
              </button>
            </div>
            
            {/* Barra de progreso de ventas */}
            {raffle && tickets.length > 0 && (
              <TicketProgressBar 
                tickets={tickets} 
                totalTickets={raffle.totalTickets} 
              />
            )}
            
            {/* El buscador de boletos específicos ha sido eliminado */}
            
            {/* Filtros */}
            <TicketFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCount={selectedTickets.length}
            />
            
            {/* Ya no necesitamos el componente TicketActions global, ahora las acciones están en cada fila */}
            
            {/* Tabla de boletos */}
            <TicketsTable
              tickets={currentTickets}
              selectedTickets={selectedTickets}
              toggleTicketSelection={toggleTicketSelection}
              selectAll={selectAll}
              highlightTicket={undefined}
              updateTicketsStatus={updateTicketsStatus}
              openSaleModal={openSaleModal}
            />
            
            {/* Paginación */}
            <TicketPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalTickets={currentTickets.length}
              ticketsPerPage={100}
              indexOfFirstTicket={indexOfFirstTicket}
              indexOfLastTicket={indexOfLastTicket}
              paginate={paginate}
              prevPage={prevPage}
              nextPage={nextPage}
            />
            
            {/* Modal para completar venta */}
            <SaleModal
              show={showSaleModal}
              selectedTickets={selectedTickets}
              buyerInfo={buyerInfo}
              setBuyerInfo={setBuyerInfo}
              onClose={closeSaleModal}
              onComplete={completeSale}
            />
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default TicketsPage;
