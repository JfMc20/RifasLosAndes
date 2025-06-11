import React from 'react';
import { Promotion } from '@/types';

interface PromotionsDisplayProps {
  promotions: Promotion[];
}

const promotionsData = [
  { id: 'promo0', name: '1 número', details: '1 boleto', price: '$30', count: 1 },
];

const PromotionsDisplay: React.FC<PromotionsDisplayProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="font-title text-2xl text-red-600 mb-4 text-center">
        Promociones Especiales
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div
            key={promo._id}
            className="flex flex-col items-center border border-gray-200 rounded-md p-4 hover:shadow-md transition-all"
          >
            <div className="text-yellow-500 font-title text-3xl font-bold mb-2">
              {promo.quantity === 1
                ? '1 número'
                : `${promo.quantity} números`}
            </div>
            <div className="text-red-600 font-bold text-2xl mb-2">
              ${promo.price} USD
            </div>
            <p className="text-gray-700 text-center text-sm">{promo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionsDisplay;
