import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Raffle, Promotion } from '../../types';

interface RaffleFormProps {
  initialRaffle?: Raffle;
  initialPromotions?: Promotion[];
  isEditing?: boolean;
  onSubmit: (raffleData: Partial<Raffle>, promotions: Partial<Promotion>[]) => Promise<void>;
}

const RaffleForm: React.FC<RaffleFormProps> = ({
  initialRaffle,
  initialPromotions = [],
  isEditing = false,
  onSubmit,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para la rifa
  const [raffleData, setRaffleData] = useState<Partial<Raffle>>({
    name: '',
    prize: '',
    totalTickets: 100,
    ticketPrice: 10,
    drawMethod: 'Lotería Nacional',
    isActive: true,
    ...initialRaffle,
  });

  // Estado para las promociones
  const [promotions, setPromotions] = useState<Partial<Promotion>[]>(
    initialPromotions.length > 0 
      ? initialPromotions 
      : [
          { quantity: 2, price: 0, description: '2 boletos' },
          { quantity: 5, price: 0, description: '5 boletos' },
        ]
  );

  // Actualizar estados cuando cambian los props
  useEffect(() => {
    if (initialRaffle) {
      setRaffleData({
        ...raffleData,
        ...initialRaffle,
      });
    }
    
    if (initialPromotions && initialPromotions.length > 0) {
      setPromotions(initialPromotions);
    }
  }, [initialRaffle, initialPromotions]);

  // Manejar cambios en los campos de la rifa
  const handleRaffleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convertir a número para campos numéricos
    if (type === 'number') {
      setRaffleData({
        ...raffleData,
        [name]: parseFloat(value),
      });
    } 
    // Convertir a booleano para checkbox
    else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setRaffleData({
        ...raffleData,
        [name]: target.checked,
      });
    } 
    // Texto normal para el resto
    else {
      setRaffleData({
        ...raffleData,
        [name]: value,
      });
    }
  };

  // Manejar cambios en los campos de promociones
  const handlePromotionChange = (index: number, field: string, value: any) => {
    const updatedPromotions = [...promotions];
    updatedPromotions[index] = {
      ...updatedPromotions[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) : value,
    };
    setPromotions(updatedPromotions);
  };

  // Agregar nueva promoción
  const addPromotion = () => {
    setPromotions([
      ...promotions,
      {
        quantity: 0,
        price: 0,
        description: '',
      },
    ]);
  };

  // Eliminar promoción
  const removePromotion = (index: number) => {
    const updatedPromotions = [...promotions];
    updatedPromotions.splice(index, 1);
    setPromotions(updatedPromotions);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!raffleData.name || !raffleData.prize || !raffleData.totalTickets || !raffleData.ticketPrice) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onSubmit(raffleData, promotions);
    } catch (err: any) {
      console.error('Error al guardar rifa:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al guardar. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Información de la Rifa</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Rifa *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={raffleData.name || ''}
              onChange={handleRaffleChange}
              required
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-1">
              Premio *
            </label>
            <input
              type="text"
              id="prize"
              name="prize"
              value={raffleData.prize || ''}
              onChange={handleRaffleChange}
              required
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700 mb-1">
              Total de Boletos *
            </label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              value={raffleData.totalTickets || ''}
              onChange={handleRaffleChange}
              min="1"
              required
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Boleto ($) *
            </label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={raffleData.ticketPrice || ''}
              onChange={handleRaffleChange}
              min="0.01"
              step="0.01"
              required
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="drawMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Método de Sorteo
            </label>
            <input
              type="text"
              id="drawMethod"
              name="drawMethod"
              value={raffleData.drawMethod || ''}
              onChange={handleRaffleChange}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center h-full pt-6">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={raffleData.isActive || false}
              onChange={handleRaffleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Rifa Activa
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Promociones</h2>
          <button
            type="button"
            onClick={addPromotion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
          >
            Agregar Promoción
          </button>
        </div>

        {promotions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay promociones configuradas</p>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion, index) => (
              <div key={index} className="flex flex-wrap items-end gap-4 pb-4 border-b border-gray-200">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={promotion.quantity || 0}
                    onChange={(e) => handlePromotionChange(index, 'quantity', e.target.value)}
                    min="2"
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={promotion.price || 0}
                    onChange={(e) => handlePromotionChange(index, 'price', e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={promotion.description || ''}
                    onChange={(e) => handlePromotionChange(index, 'description', e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => removePromotion(index)}
                    className="inline-flex items-center justify-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-100 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Rifa' : 'Crear Rifa'}
        </button>
      </div>
    </form>
  );
};

export default RaffleForm;
