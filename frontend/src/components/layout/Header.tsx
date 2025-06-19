import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OptimizedImage from '../ui/OptimizedImage';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Efecto para detectar scroll y cambiar la apariencia
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      // Cerrar popup de participar
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
      
      // Cerrar menú móvil al hacer clic fuera
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // No cerrar si el clic fue en el botón del menú
        if (!target.closest('[aria-label="Toggle menu"]')) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Para cerrar el menú móvil si cambia el tamaño de la ventana a desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint en Tailwind
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
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
            {/* --- CAMBIO REALIZADO AQUÍ --- */}
            <OptimizedImage 
              src="/images/LOGO.png" 
              alt="Rifa Los Andes" 
              width={60} 
              height={36} 
              style={{ objectFit: "contain" }}
              className="relative z-10 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_3px_rgba(234,179,8,0.7)]" 
              priority
              quality={85}
              useOptimized={true}
              optimizedSize="sm"
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  // X icon when menu is open
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Hamburger icon when menu is closed
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}
        
        {/* Mobile menu panel */}
        <div 
          ref={mobileMenuRef}
          className={`fixed top-[57px] right-0 bottom-0 w-3/4 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden overflow-y-auto`}
        >
          <div className="py-6 px-6 flex flex-col space-y-6">
            <Link 
              href="#tickets" 
              className="text-white text-base uppercase font-bold hover:text-yellow-500 transition-colors flex items-center" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </span>
              Números
            </Link>
            <Link 
              href="#payment-methods" 
              className="text-white text-base uppercase font-bold hover:text-yellow-500 transition-colors flex items-center" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </span>
              Métodos de pago
            </Link>
            <Link 
              href="#faq" 
              className="text-white text-base uppercase font-bold hover:text-yellow-500 transition-colors flex items-center" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                </svg>
              </span>
              Preguntas frecuentes
            </Link>
            <button 
              onClick={() => {
                window.location.href = '#tickets';
                setMobileMenuOpen(false);
              }}
              className="bg-yellow-500 text-gray-900 text-base px-4 py-3 rounded-md font-bold uppercase hover:bg-yellow-600 transition-colors flex items-center justify-center mt-4"
            >
              <span className="mr-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                </svg>
              </span>
              Participar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;