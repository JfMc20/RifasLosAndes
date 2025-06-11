import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Línea decorativa superior similar al header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600"></div>
        
        {/* Círculos decorativos en negro semi-transparentes */}
        <div className="absolute top-1/4 right-1/6 w-32 h-32 rounded-full bg-black opacity-[0.03]"></div>
        <div className="absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full bg-black opacity-[0.02]"></div>
        <div className="absolute top-2/3 right-1/3 w-16 h-16 rounded-full bg-black opacity-[0.04]"></div>
        
        {/* Círculos de color muy sutiles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-red-600 opacity-[0.05] rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-green-600 opacity-[0.05] rounded-full blur-xl"></div>
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-title text-xl font-bold mb-4 uppercase">Rifa Los Andes</h3>
            <p className="text-white">
              Tu oportunidad de ganar un Toyota Corolla 2020 SE por solo $30 USD.
            </p>
          </div>
          
          <div>
            <h4 className="font-title text-lg font-bold mb-4 uppercase">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#tickets" className="text-white hover:text-red-200 transition-colors">
                  Números disponibles
                </Link>
              </li>
              <li>
                <Link href="#payment-methods" className="text-white hover:text-red-200 transition-colors">
                  Métodos de pago
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-white hover:text-red-200 transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-title text-lg font-bold mb-4 uppercase">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@rifalosandes.com" className="text-white hover:text-red-200 transition-colors">info@rifalosandes.com</a>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <a href="https://wa.me/PHONE_NUMBER_HERE" className="text-white hover:text-red-200 transition-colors">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-red-600 mt-8 pt-6 text-center text-white">
          <p className="text-white">© {new Date().getFullYear()} Rifa Los Andes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
