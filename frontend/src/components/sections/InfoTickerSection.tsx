import { InfoTicker } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface InfoTickerSectionProps {
  infoTicker: InfoTicker;
}

const InfoTickerSection: React.FC<InfoTickerSectionProps> = ({ infoTicker }) => {
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [duration, setDuration] = useState(15); // duración en segundos

  useEffect(() => {
    // Detectar el ancho del contenedor y del contenido para calcular la duración de la animación
    const handleResize = () => {
      const container = document.getElementById('ticker-container');
      const content = document.getElementById('ticker-content');
      
      if (container && content) {
        setContainerWidth(container.offsetWidth);
        setContentWidth(content.scrollWidth);
        
        // Ajustar la duración basada en el ancho del contenido (a más contenido, más tiempo)
        const calculatedDuration = Math.max(15, content.scrollWidth / 50);
        setDuration(calculatedDuration);
        
        // Establecer el ancho para que la animación sepa cuánta distancia recorrer
        setWidth(container.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [infoTicker]); // Recalcular cuando cambia la información del ticker

  const tickerContent = `💰 Precio: ${infoTicker.ticketPrice} · 📅 Fecha de sorteo: ${infoTicker.drawDate} · 📱 Anuncio por: ${infoTicker.announcementChannel} ${infoTicker.additionalInfo ? `· ℹ️ ${infoTicker.additionalInfo}` : ''}`;

  return (
    <div className="bg-black/90 py-2 border-t border-yellow-500/40" id="ticker-container">
      <div className="overflow-hidden relative container mx-auto">
        <motion.div
          id="ticker-content"
          initial={{ x: width }}
          animate={{ 
            x: [-contentWidth, width] 
          }}
          transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="whitespace-nowrap text-white font-medium flex items-center text-sm"
        >
          <span className="px-4">{tickerContent}</span>
          <span className="px-4">{tickerContent}</span>
          <span className="px-4">{tickerContent}</span>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoTickerSection;
