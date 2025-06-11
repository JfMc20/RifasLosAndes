import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Efecto para detectar scroll y cambiar la apariencia
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <header className={`bg-gray-900 ${scrolled ? 'py-1 shadow-lg' : 'py-2 shadow-md'} transition-all duration-300 relative z-40`}>
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600"></div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500 opacity-[0.05] rounded-full -translate-y-1/2 translate-x-1/3 blur-sm"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-red-600 opacity-[0.05] rounded-full translate-y-1/2 -translate-x-1/3 blur-sm"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center relative group">
            <div className="absolute inset-0 bg-black opacity-5 blur-sm rounded-full scale-90 group-hover:scale-110 transition-transform duration-300"></div>
            <Image 
              src="/images/LOGO.png" 
              alt="Rifa Los Andes" 
              width={90} 
              height={40} 
              className="object-contain relative z-10 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_3px_rgba(234,179,8,0.7)]" 
              priority
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-5">
            <Link href="#tickets" className="text-white text-sm uppercase font-bold hover:text-yellow-500 transition-colors relative group">
              <span className="relative z-10">Números</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#payment-methods" className="text-white text-sm uppercase font-bold hover:text-yellow-500 transition-colors relative group">
              <span className="relative z-10">Métodos de pago</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#faq" className="text-white text-sm uppercase font-bold hover:text-yellow-500 transition-colors relative group">
              <span className="relative z-10">Preguntas frecuentes</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <button 
              onClick={() => setShowPopup(!showPopup)}
              className="bg-yellow-500 text-gray-900 text-sm px-3 py-1.5 rounded-md font-bold uppercase hover:bg-yellow-600 transition-colors transform hover:scale-105 shadow-sm hover:shadow-md relative"
            >
              Participar
              
              {/* Notificación popup */}
              {showPopup && (
                <div 
                  ref={popupRef}
                  className="absolute right-0 top-full mt-2 w-72 bg-white text-gray-800 rounded-md shadow-lg p-4 z-50 text-left border-l-4 border-yellow-500 animate-fade-in"
                  style={{ animation: 'slideIn 0.3s ease-out' }}
                >
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => setShowPopup(false)}
                      className="text-gray-400 hover:text-gray-600" 
                      aria-label="Cerrar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-red-600 text-base">¡PARTICIPA Y GANA!</h3>
                  <p className="text-sm my-2">Recuerda que con Rifas Los Andes tendrás la posibilidad de ganar increíbles premios solo jugando con nosotros!</p>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '#tickets';
                      setShowPopup(false);
                    }} 
                    className="mt-2 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center w-full shadow-sm transform hover:scale-[1.02]"
                  >
                    <span>Ver oportunidades</span>
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              )}
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-white hover:text-yellow-500 focus:outline-none bg-white/10 hover:bg-white/20 transition-all"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
