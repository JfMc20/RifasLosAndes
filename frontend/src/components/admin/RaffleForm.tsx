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
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg flex items-center gap-4" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <strong className="font-bold">¡Error!</strong>
                <p>{error}</p>
            </div>
        </div>
      )}

      <div className="bg-ui-surface rounded-xl shadow-lg border border-ui-border p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ui-text-primary">Información General</h2>
          <p className="text-ui-text-secondary mt-1">Define los detalles principales de tu rifa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-bold text-ui-text-secondary mb-2">Nombre de la Rifa</label>
            <input
              type="text"
              id="name"
              name="name"
              value={raffleData.name || ''}
              onChange={handleRaffleChange}
              required
              className="block w-full p-3 bg-ui-background border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: Rifa para el viaje de estudios"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="prize" className="block text-sm font-bold text-ui-text-secondary mb-2">Premio</label>
            <textarea
              id="prize"
              name="prize"
              value={raffleData.prize || ''}
              onChange={handleRaffleChange}
              required
              rows={3}
              className="block w-full p-3 bg-ui-background border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: Un auto 0km, un viaje a la playa, etc."
            />
          </div>

          <div>
            <label htmlFor="totalTickets" className="block text-sm font-bold text-ui-text-secondary mb-2">Total de Boletos</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              value={raffleData.totalTickets || ''}
              onChange={handleRaffleChange}
              required
              className="block w-full p-3 bg-ui-background border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
            />
          </div>

          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-bold text-ui-text-secondary mb-2">Precio por Boleto ($)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={raffleData.ticketPrice || ''}
              onChange={handleRaffleChange}
              required
              className="block w-full p-3 bg-ui-background border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
            />
          </div>

          <div>
            <label htmlFor="drawMethod" className="block text-sm font-bold text-ui-text-secondary mb-2">Método de Sorteo</label>
            <select
              id="drawMethod"
              name="drawMethod"
              value={raffleData.drawMethod || ''}
              onChange={handleRaffleChange}
              className="block w-full p-3 bg-ui-background border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
            >
              <option>Lotería Nacional</option>
              <option>Tómbola</option>
              <option>Otro</option>
            </select>
          </div>

          <div className="flex items-center justify-start mt-6">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={raffleData.isActive || false}
              onChange={handleRaffleChange}
              className="h-5 w-5 text-brand-accent bg-ui-background border-ui-border rounded focus:ring-brand-accent transition"
            />
            <label htmlFor="isActive" className="ml-3 block text-sm font-bold text-ui-text-primary">
              Rifa Activa
            </label>
          </div>
        </div>
      </div>

      <div className="bg-ui-surface rounded-xl shadow-lg border border-ui-border p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-ui-text-primary">Promociones</h2>
            <p className="text-ui-text-secondary mt-1">Configura ofertas especiales para la compra de múltiples boletos.</p>
          </div>
          <button
            type="button"
            onClick={addPromotion}
            className="px-4 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-brand-accent-dark transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            Agregar Promoción
          </button>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-ui-text-secondary">No hay promociones configuradas.</p>
            <p className="text-sm text-ui-text-secondary/80">Puedes agregar una usando el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion, index) => (
              <div key={index} className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-ui-border bg-ui-background">
                <div className="flex-grow min-w-[100px]">
                  <label className="block text-sm font-bold text-ui-text-secondary mb-2">Cantidad</label>
                  <input
                    type="number"
                    value={promotion.quantity || ''}
                    onChange={(e) => handlePromotionChange(index, 'quantity', e.target.value)}
                    min="2"
                    className="block w-full p-3 bg-ui-surface border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
                  />
                </div>
                
                <div className="flex-grow min-w-[100px]">
                  <label className="block text-sm font-bold text-ui-text-secondary mb-2">Precio ($)</label>
                  <input
                    type="number"
                    value={promotion.price || ''}
                    onChange={(e) => handlePromotionChange(index, 'price', e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="block w-full p-3 bg-ui-surface border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
                  />
                </div>
                
                <div className="flex-grow min-w-[200px]">
                  <label className="block text-sm font-bold text-ui-text-secondary mb-2">Descripción</label>
                  <input
                    type="text"
                    value={promotion.description || ''}
                    onChange={(e) => handlePromotionChange(index, 'description', e.target.value)}
                    className="block w-full p-3 bg-ui-surface border-ui-border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
                  />
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => removePromotion(index)}
                    className="p-3 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors duration-200"
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

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-ui-border shadow-sm text-sm font-bold rounded-lg text-ui-text-primary bg-ui-surface hover:bg-ui-background focus:outline-none transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 border border-transparent shadow-lg text-sm font-bold rounded-lg text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Rifa' : 'Crear Rifa'}
        </button>
      </div>
    </form>
  );
};

export default RaffleForm;
