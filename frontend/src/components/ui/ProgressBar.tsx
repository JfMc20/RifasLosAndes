import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  total: number;
  sold: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ total, sold }) => {
  const percentage = Math.min(Math.round((sold / total) * 100), 100);
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs md:text-sm font-medium text-yellow-500">
          Progreso de la rifa
        </span>
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xs md:text-sm font-bold bg-amber-400 text-gray-800 px-2 py-0.5 rounded-full"
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
        <motion.div 
          className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 via-red-500 to-green-600"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>0</span>
        <span>Vendidos: {sold} de {total}</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
