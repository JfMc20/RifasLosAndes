import React from 'react';
import { Raffle } from '../../../types';

interface RaffleDetailsProps {
  raffle: Raffle;
}

const RaffleDetails: React.FC<RaffleDetailsProps> = ({ raffle }) => {
  return (
    <div className="bg-ui-surface shadow-lg rounded-xl p-6 border border-ui-border">
      <h3 className="text-xl font-bold text-ui-text-primary mb-4">Detalles de la Rifa</h3>
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-semibold text-ui-text-secondary tracking-wide uppercase">Nombre</p>
          <p className="text-ui-text-primary text-base">{raffle.name}</p>
        </div>
        <div>
          <p className="font-semibold text-ui-text-secondary tracking-wide uppercase">Premio</p>
          <p className="text-ui-text-primary text-base">{raffle.prize}</p>
        </div>
        <div>
          <p className="font-semibold text-ui-text-secondary tracking-wide uppercase">Precio del Boleto</p>
          <p className="text-ui-text-primary text-base font-bold">${raffle.ticketPrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RaffleDetails;
