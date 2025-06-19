import { InfoTicker } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface InfoTickerSectionProps {
  infoTicker: InfoTicker;
}

const InfoTickerSection: React.FC<InfoTickerSectionProps> = ({ infoTicker }) => {
  // Se vuelven a usar estados simples para las dimensiones y duración
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [duration, setDuration] = useState(15);

  useEffect(() => {
    // La lógica para calcular el tamaño y la duración se mantiene
    const handleResize = () => {
      const container = document.getElementById('ticker-container-inner');
      const content = document.getElementById('ticker-content');
      
      if (container && content) {
        setContainerWidth(container.offsetWidth);
        setContentWidth(content.scrollWidth);
        
        const calculatedDuration = Math.max(15, content.scrollWidth / 50);
        setDuration(calculatedDuration);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [infoTicker]); // Se recalcula si el texto cambia

  const tickerContent = `💰 Precio: ${infoTicker.ticketPrice} · 📅 Fecha de sorteo: ${infoTicker.drawDate} · 📱 Anuncio por: ${infoTicker.announcementChannel} ${infoTicker.additionalInfo ? `· ℹ️ ${infoTicker.additionalInfo}` : ''}`;

  return (
    <div className="bg-black/90 py-2 border-t border-yellow-500/40">
      {/* Se le añade un id único al contenedor interno para evitar conflictos */}
      <div className="overflow-hidden relative container mx-auto" id="ticker-container-inner">
        <motion.div
          id="ticker-content"
          // 1. Se restaura la animación declarativa
          initial={{ x: containerWidth }}
          animate={{ x: -contentWidth }}
          transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop", // 'loop' hace que salte al inicio para un scroll continuo
          }}
          className="whitespace-nowrap text-white font-medium flex items-center text-sm"
        >
          {/* Se duplica el contenido para un efecto de scroll infinito y sin cortes */}
          <span className="px-4">{tickerContent}</span>
          <span className="px-4">{tickerContent}</span>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoTickerSection;