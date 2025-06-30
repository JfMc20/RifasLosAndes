import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Raffle, Promotion } from '../../types';

interface RaffleFormProps {
  initialRaffle?: Raffle;
  initialPromotions?: Promotion[];
  isEditing?: boolean;
  onSubmit: (raffleData: Partial<Raffle>, promotions: Partial<Promotion>[]) => Promise<void>;
}

// Define un tipo para los datos del formulario para react-hook-form
type RaffleFormData = Omit<Partial<Raffle>, 'promotions'> & {
  promotions: Partial<Promotion>[];
};

const RaffleForm: React.FC<RaffleFormProps> = ({
  initialRaffle,
  initialPromotions = [],
  isEditing = false,
  onSubmit,
}) => {
  const router = useRouter();
  // isLoading se usará para el estado de envío del formulario
  // setError de react-hook-form se usará para errores de API si es necesario, o un estado local.
  const [apiError, setApiError] = useState('');

  const defaultPromotions = [
    { quantity: 2, price: 0, description: '2 boletos' },
    { quantity: 5, price: 0, description: '5 boletos' },
  ];

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<RaffleFormData>({
    defaultValues: {
      name: initialRaffle?.name || '',
      prize: initialRaffle?.prize || '',
      totalTickets: initialRaffle?.totalTickets || 100,
      ticketPrice: initialRaffle?.ticketPrice || 10,
      drawMethod: initialRaffle?.drawMethod || 'Lotería Nacional',
      isActive: initialRaffle?.isActive === undefined ? true : initialRaffle.isActive,
      promotions: initialPromotions && initialPromotions.length > 0 ? initialPromotions : defaultPromotions,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "promotions"
  });

  // Observar isActive para la lógica de UI si es necesario
  const isActiveValue = watch("isActive");
  const promotions = watch("promotions");


  // Resetear el formulario cuando initialRaffle o initialPromotions cambien (para modo edición)
  useEffect(() => {
    if (isEditing && initialRaffle) {
      reset({
        name: initialRaffle.name,
        prize: initialRaffle.prize,
        totalTickets: initialRaffle.totalTickets,
        ticketPrice: initialRaffle.ticketPrice,
        drawMethod: initialRaffle.drawMethod,
        isActive: initialRaffle.isActive,
        promotions: initialPromotions && initialPromotions.length > 0 ? initialPromotions : defaultPromotions,
      });
    }
  }, [initialRaffle, initialPromotions, isEditing, reset]);


  const handleFormSubmit = async (data: RaffleFormData) => {
    setApiError(''); // Limpiar errores de API previos
    try {
      // Separar promotions de raffleData según la firma de onSubmit
      const { promotions, ...raffleDetails } = data;
      await onSubmit(raffleDetails, promotions);
    } catch (err: any) {
      console.error('Error al guardar rifa:', err);
      setApiError(err.response?.data?.message || 'Ocurrió un error al guardar. Por favor intenta nuevamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {apiError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg flex items-center gap-4" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <strong className="font-bold">¡Error de API!</strong>
                <p>{apiError}</p>
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
              {...register("name", { required: "El nombre de la rifa es obligatorio." })}
              className={`block w-full p-3 bg-ui-background border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
              placeholder="Ej: Rifa para el viaje de estudios"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="prize" className="block text-sm font-bold text-ui-text-secondary mb-2">Premio</label>
            <textarea
              id="prize"
              {...register("prize", { required: "El premio es obligatorio." })}
              rows={3}
              className={`block w-full p-3 bg-ui-background border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.prize ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
              placeholder="Ej: Un auto 0km, un viaje a la playa, etc."
            />
            {errors.prize && <p className="mt-1 text-xs text-red-500">{errors.prize.message}</p>}
          </div>

          <div>
            <label htmlFor="totalTickets" className="block text-sm font-bold text-ui-text-secondary mb-2">Total de Boletos</label>
            <input
              type="number"
              id="totalTickets"
              {...register("totalTickets", {
                required: "El total de boletos es obligatorio.",
                valueAsNumber: true,
                min: { value: 1, message: "Debe haber al menos 1 boleto." }
              })}
              className={`block w-full p-3 bg-ui-background border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.totalTickets ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
            />
            {errors.totalTickets && <p className="mt-1 text-xs text-red-500">{errors.totalTickets.message}</p>}
          </div>

          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-bold text-ui-text-secondary mb-2">Precio por Boleto ($)</label>
            <input
              type="number"
              id="ticketPrice"
              {...register("ticketPrice", {
                required: "El precio del boleto es obligatorio.",
                valueAsNumber: true,
                min: { value: 0.01, message: "El precio debe ser mayor que cero." }
              })}
              step="0.01"
              className={`block w-full p-3 bg-ui-background border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.ticketPrice ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
            />
            {errors.ticketPrice && <p className="mt-1 text-xs text-red-500">{errors.ticketPrice.message}</p>}
          </div>

          <div>
            <label htmlFor="drawMethod" className="block text-sm font-bold text-ui-text-secondary mb-2">Método de Sorteo</label>
            <select
              id="drawMethod"
              {...register("drawMethod")}
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
              type="checkbox"
              {...register("isActive")}
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
            onClick={() => append({ quantity: 0, price: 0, description: '' })}
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
            {fields.map((item, index) => (
              <div key={item.id} className="flex flex-wrap items-start gap-4 p-4 rounded-lg border border-ui-border bg-ui-background">
                <div className="flex-grow min-w-[100px]">
                  <label htmlFor={`promotions.${index}.quantity`} className="block text-sm font-bold text-ui-text-secondary mb-1">Cantidad</label>
                  <input
                    type="number"
                    id={`promotions.${index}.quantity`}
                    {...register(`promotions.${index}.quantity` as const, {
                      valueAsNumber: true,
                      required: "Cantidad es requerida.",
                      min: { value: 1, message: "Mínimo 1." }
                    })}
                    className={`block w-full p-3 bg-ui-surface border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.promotions?.[index]?.quantity ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
                  />
                  {errors.promotions?.[index]?.quantity && <p className="mt-1 text-xs text-red-500">{errors.promotions[index]?.quantity?.message}</p>}
                </div>
                
                <div className="flex-grow min-w-[100px]">
                  <label htmlFor={`promotions.${index}.price`} className="block text-sm font-bold text-ui-text-secondary mb-1">Precio ($)</label>
                  <input
                    type="number"
                    id={`promotions.${index}.price`}
                    {...register(`promotions.${index}.price` as const, {
                        valueAsNumber: true,
                        required: "Precio es requerido.",
                        min: { value: 0.01, message: "Precio > 0." }
                    })}
                    step="0.01"
                    className={`block w-full p-3 bg-ui-surface border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.promotions?.[index]?.price ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
                  />
                  {errors.promotions?.[index]?.price && <p className="mt-1 text-xs text-red-500">{errors.promotions[index]?.price?.message}</p>}
                </div>
                
                <div className="flex-grow min-w-[200px]">
                  <label htmlFor={`promotions.${index}.description`} className="block text-sm font-bold text-ui-text-secondary mb-1">Descripción</label>
                  <input
                    type="text"
                    id={`promotions.${index}.description`}
                    {...register(`promotions.${index}.description` as const, {
                        required: "Descripción es requerida."
                    })}
                    className={`block w-full p-3 bg-ui-surface border rounded-lg focus:ring-2 focus:border-brand-accent transition ${errors.promotions?.[index]?.description ? 'border-red-500 focus:ring-red-500' : 'border-ui-border focus:ring-brand-accent'}`}
                  />
                  {errors.promotions?.[index]?.description && <p className="mt-1 text-xs text-red-500">{errors.promotions[index]?.description?.message}</p>}
                </div>
                
                <div className="pt-7"> {/* Alineación vertical del botón con los inputs */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
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
          disabled={isSubmitting}
          className="px-6 py-3 border border-transparent shadow-lg text-sm font-bold rounded-lg text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Rifa' : 'Crear Rifa'}
        </button>
      </div>
    </form>
  );
};

export default RaffleForm;
