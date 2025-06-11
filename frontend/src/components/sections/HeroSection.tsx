import { HeroContent, InfoTicker } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import InfoTickerSection from './InfoTickerSection';

interface HeroSectionProps {
  heroContent: HeroContent;
  infoTicker?: InfoTicker;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroContent, infoTicker }) => {
  // Scroll to tickets section when button is clicked
  const scrollToTickets = () => {
    const element = document.getElementById('tickets');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Usamos la clase animate-bounce de Tailwind para la animación
  
  return (
    <section className="relative h-screen w-full overflow-hidden max-w-[100vw]">
      {/* Imagen de fondo a pantalla completa */}
      <div className="absolute inset-0 w-full h-full">
        {heroContent.imageUrl ? (
          <Image
            src={heroContent.imageUrl}
            alt={`${heroContent.title}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
            className=""  // Quitamos el filtro de brillo para mostrar la imagen con su calidad original
            onError={(e) => {
              console.error('Error loading image:', heroContent.imageUrl);
              // Fall back to a placeholder image
              (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">Imagen no disponible</span>
          </div>
        )}
      </div>
      
      {/* Overlay oscuro para mejorar legibilidad del texto (reducido para mejor visualización de la imagen) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent"></div>
      
      {/* Botón eliminado del centro */}
      
      {/* Contenedor inferior con títulos encima del ticker */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Botón encima del texto */}
        <div className="container mx-auto px-4 pb-3 z-30 relative flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTickets}
            className="bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-6 rounded-md font-bold text-lg transition-all text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.25)] animate-bounce mb-2"
          >
            Ver números disponibles
          </motion.button>
        </div>
        
        {/* Título simple en una línea */}
        <div className="container mx-auto px-4 pb-4 z-20 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-full"
          >
            <h1 className="font-title text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Gran Rifa Toyota Corolla 2020 - <span className="text-yellow-400">Tenemos para ti un increíble premio que no querrás dejar pasar</span>
            </h1>
          </motion.div>
        </div>
        
        {/* InfoTicker */}
        {infoTicker && <InfoTickerSection infoTicker={infoTicker} />}
      </div>
    </section>
  );
};

export default HeroSection;
