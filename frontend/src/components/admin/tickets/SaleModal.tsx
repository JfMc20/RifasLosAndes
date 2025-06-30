import React from 'react';

interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
  transactionId: string;
}

interface SaleModalProps {
  show: boolean;
  selectedTickets: string[];
  buyerInfo: BuyerInfo;
  setBuyerInfo: (info: BuyerInfo) => void;
  onClose: () => void;
  onComplete: () => void;
}

const SaleModal: React.FC<SaleModalProps> = ({
  show,
  selectedTickets,
  buyerInfo,
  setBuyerInfo,
  onClose,
  onComplete
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-ui-surface rounded-xl shadow-2xl p-8 max-w-md w-full border border-ui-border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-ui-text-primary">Completar Venta</h3>
            <p className="text-sm text-ui-text-secondary mt-1">
              Boletos: <span className="font-semibold text-brand-accent">{selectedTickets.join(', ')}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-ui-text-secondary hover:text-ui-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ui-text-secondary mb-2">
              Nombre del Comprador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyerInfo.name}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
              required
              className="block w-full rounded-lg border-ui-border bg-ui-background p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-ui-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={buyerInfo.email}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
              className="block w-full rounded-lg border-ui-border bg-ui-background p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: correo@ejemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-ui-text-secondary mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={buyerInfo.phone}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
              className="block w-full rounded-lg border-ui-border bg-ui-background p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-ui-text-secondary mb-2">
              ID de Transacción
            </label>
            <input
              type="text"
              value={buyerInfo.transactionId}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, transactionId: e.target.value })}
              className="block w-full rounded-lg border-ui-border bg-ui-background p-3 text-ui-text-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition"
              placeholder="Ej: 12345ABC"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-3 border border-ui-border rounded-lg text-sm font-bold text-ui-text-primary bg-ui-surface hover:bg-ui-background transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onComplete}
            disabled={!buyerInfo.name}
            className={`px-5 py-3 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary-dark transition-all duration-200 transform hover:scale-105 ${
              !buyerInfo.name ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Completar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
