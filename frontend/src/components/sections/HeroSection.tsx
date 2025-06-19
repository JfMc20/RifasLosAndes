import { HeroContent, InfoTicker } from '@/types';
import { motion } from 'framer-motion';
import InfoTickerSection from './InfoTickerSection';
import { useState } from 'react';
import OptimizedImage from '../ui/OptimizedImage';

interface HeroSectionProps {
  heroContent: HeroContent;
  infoTicker?: InfoTicker;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroContent, infoTicker }) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const scrollToTickets = () => {
    const element = document.getElementById('tickets');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="w-full bg-gray-900 flex flex-col items-center md:block">
      
      {infoTicker && <InfoTickerSection infoTicker={infoTicker} />}
      
      {/* 1. Contenedor principal ahora no tiene ancho máximo, será 100% del viewport */}
      <div className="w-full md:relative">
        
        <div className="relative"> 
          {heroContent.imageUrl ? (
            <OptimizedImage
              src={heroContent.imageUrl}
              alt={heroContent.title || 'Hero Image'}
              width={1280}
              height={720}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: 'auto'
              }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vw"
              quality={75}
              useOptimized={true}
              optimizedSize="md"
              className={`transition-opacity duration-700 ease-in-out ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadingStateChange={(isLoading) => setImageLoading(isLoading)}
            />
          ) : (
            <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">Imagen no disponible</span>
            </div>
          )}

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            </div>
          )}
        </div>

        <div className="w-full md:absolute md:bottom-0 md:left-0 md:right-0 md:z-10">
          
          <div className="w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent md:from-black/80 md:via-black/40">
            
            {/* 2. Contenedor del contenido ahora se centra y limita su ancho internamente */}
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center text-center space-y-4 p-6 md:space-y-6 md:p-8">
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToTickets}
                  className="bg-yellow-500 text-gray-900 font-bold uppercase rounded-md shadow-lg hover:shadow-xl hover:bg-yellow-600 transition-all transform animate-bounce px-6 py-2 text-base md:px-8 md:py-3"
                >
                  Ver números disponibles
                </motion.button>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white w-full"
                >
                  <h1 className="font-title font-bold drop-shadow-lg text-xl sm:text-2xl md:text-3xl md:whitespace-nowrap lg:text-4xl">
                    {heroContent.title}{' '}
                    {heroContent.subtitle && (
                      <span className="text-yellow-400">{heroContent.subtitle}</span>
                    )}
                  </h1>
                  {heroContent.description && (
                    <p className="text-gray-200 mt-2 text-xs sm:text-sm md:text-base"> 
                      {heroContent.description}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;