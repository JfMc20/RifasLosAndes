import React, { useState, useEffect, useRef } from 'react';
import { PrizeCarouselContent } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import OptimizedImage from '../ui/OptimizedImage';

interface PrizeCarouselSectionProps {
  carouselContent: PrizeCarouselContent | null;
}

const PrizeCarouselSection: React.FC<PrizeCarouselSectionProps> = ({ carouselContent }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<number[]>([0]); // Inicialmente solo la primera imagen está cargada
  const [imagesLoading, setImagesLoading] = useState<{[key: number]: boolean}>({0: true}); // Estado para rastrear imágenes cargando
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({}); // Estado para rastrear errores de imágenes
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "0px 0px -200px 0px" });

  if (!carouselContent || !carouselContent.images || carouselContent.images.length === 0) {
    return null;
  }
  
  // Precargar la siguiente imagen cuando la actual está en vista
  useEffect(() => {
    const nextIndex = activeIndex === carouselContent.images.length - 1 ? 0 : activeIndex + 1;
    
    if (!loadedImages.includes(nextIndex)) {
      // Marcar la siguiente imagen como "cargando"
      setImagesLoading(prev => ({ ...prev, [nextIndex]: true }));
    }
  }, [activeIndex, carouselContent.images.length, loadedImages]);
  
  // Inicializar estado de carga para la imagen actual si no existe
  useEffect(() => {
    if (imagesLoading[activeIndex] === undefined) {
      setImagesLoading(prev => ({ ...prev, [activeIndex]: true }));
    }
  }, [activeIndex, imagesLoading]);

  // Solo auto-rotar cuando está en vista
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) =>
        current === carouselContent.images.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView, carouselContent.images.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === carouselContent.images.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((current) =>
      current === 0 ? carouselContent.images.length - 1 : current - 1
    );
  };

  // Se elimina la constante textShadowStyle que ya no es necesaria.

  return (
    // El fondo se mantiene blanco (bg-gray-100) como lo pediste.
    <section ref={sectionRef} className="bg-gray-100 py-10 md:py-14 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2
            className="font-title font-bold text-black drop-shadow-md text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2"
          >
            {carouselContent.title}
          </h2>
          <p
            className="text-gray-700 drop-shadow text-xs sm:text-sm md:text-base max-w-2xl mx-auto"
          >
            <span className="text-yellow-600 font-medium">{carouselContent.description}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-xl border-[3px] border-yellow-500 shadow-[0_0_18px_2px_rgba(217,119,6,0.3)]">
            <div className="relative aspect-[3/1] sm:aspect-auto sm:h-80 md:h-96 lg:h-[26rem]">
              {carouselContent.images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === activeIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.02]'
                  }`}
                >
                  {index === activeIndex && imagesLoading[index] && !imageErrors[index] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
                    </div>
                  )}
                  
                  {(loadedImages.includes(index) || index === activeIndex || 
                   index === (activeIndex + 1) % carouselContent.images.length) && (
                     <OptimizedImage 
                       src={image}
                       alt={`Premio - Imagen ${index + 1}`}
                       fill
                       priority={index === activeIndex}
                       sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
                       style={{
                         objectFit: "contain",
                         opacity: imageErrors[index] ? "0.7" : "1",
                         filter: imageErrors[index] ? "grayscale(1)" : "none",
                       }}
                       useOptimized={true}
                       optimizedSize="md"
                       className={`transition-all duration-700 ease-in-out ${loadedImages.includes(index) ? 'opacity-100' : 'opacity-0'}`}
                       onLoadingStateChange={(isLoading) => {
                         if (!isLoading) {
                           if (!loadedImages.includes(index)) {
                             setLoadedImages(prev => [...prev, index]);
                           }
                           setImagesLoading(prev => ({ ...prev, [index]: false }));
                         }
                       }}
                       fallbackSrc="/images/placeholder.jpg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-80 text-black rounded-full p-2 transition-all focus:outline-none"
            aria-label="Anterior imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-50 hover:bg-opacity-80 text-black rounded-full p-2 transition-all focus:outline-none"
            aria-label="Siguiente imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="flex justify-center mt-4 space-x-2">
            {carouselContent.images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === activeIndex ? 'bg-yellow-500 w-6' : 'bg-gray-400 hover:bg-gray-500'}`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PrizeCarouselSection;