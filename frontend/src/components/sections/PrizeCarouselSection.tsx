import React, { useState, useEffect } from 'react';
import { PrizeCarouselContent } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PrizeCarouselSectionProps {
  carouselContent: PrizeCarouselContent | null;
}

const PrizeCarouselSection: React.FC<PrizeCarouselSectionProps> = ({ carouselContent }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Si no hay contenido o no hay imágenes, no mostramos el carrusel
  if (!carouselContent || !carouselContent.images || carouselContent.images.length === 0) {
    return null;
  }

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => 
        current === carouselContent.images.length - 1 ? 0 : current + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselContent.images.length]);

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

  return (
    <section className="bg-white py-10 md:py-14 relative overflow-hidden">
      {/* Elementos decorativos sutiles en el fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Línea decorativa superior similar al header */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-green-600 to-red-600 opacity-30"></div>
        
        {/* Círculos decorativos en negro semi-transparentes */}
        <div className="absolute top-1/4 right-1/6 w-32 h-32 rounded-full bg-black opacity-[0.04] blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full bg-black opacity-[0.03] blur-sm"></div>
        <div className="absolute top-2/3 right-1/3 w-16 h-16 rounded-full bg-black opacity-[0.05] blur-sm"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-black opacity-[0.04] blur-sm"></div>
        
        {/* Círculos de color muy sutiles */}
        <div className="absolute top-10 left-1/4 md:left-1/3 w-72 h-72 rounded-full bg-yellow-500 opacity-[0.08] blur-md"></div>
        <div className="absolute bottom-[-3rem] left-[-3rem] md:bottom-[-4rem] md:left-[-4rem] w-96 h-96 rounded-full bg-green-600 opacity-[0.07] blur-md"></div>
        <div className="absolute top-3/4 right-1/6 w-52 h-52 rounded-full bg-red-600 opacity-[0.07] blur-md"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-title text-3xl md:text-4xl font-bold text-gray-900 mb-3 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
            {carouselContent.title}
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            {carouselContent.description}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Carousel container */}
          <div className="relative overflow-hidden rounded-xl border-[3px] border-yellow-500 shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out hover:border-yellow-400 hover:shadow-[0_0_18px_2px_rgba(250,204,21,0.5)]">
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[26rem]">
              {carouselContent.images.map((image, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image
                    src={image}
                    alt={`Premio - Imagen ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="rounded-lg"
                    priority={index === 0}
                    onError={(e) => {
                      console.error('Error loading image:', image);
                      // Fall back to a placeholder image
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition-all focus:outline-none"
            aria-label="Anterior imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition-all focus:outline-none"
            aria-label="Siguiente imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {carouselContent.images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === activeIndex ? 'bg-yellow-500 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
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
