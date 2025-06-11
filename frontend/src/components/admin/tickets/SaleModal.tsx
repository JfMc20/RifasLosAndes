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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Completar venta de boletos</h3>
        
        <div className="mb-4">
          <p className="text-gray-600">
            Boletos seleccionados: {selectedTickets.join(', ')}
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Comprador *
            </label>
            <input
              type="text"
              value={buyerInfo.name}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={buyerInfo.email}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={buyerInfo.phone}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Transacción
            </label>
            <input
              type="text"
              value={buyerInfo.transactionId}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, transactionId: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onComplete}
            disabled={!buyerInfo.name}
            className={`px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
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
