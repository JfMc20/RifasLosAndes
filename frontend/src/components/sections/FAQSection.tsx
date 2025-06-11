import React from 'react';
import { FAQ } from '@/types';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { motion } from 'framer-motion';

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Línea decorativa superior similar al header */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-green-600 to-red-600 opacity-40"></div>
        
        {/* Círculos decorativos en negro semi-transparentes */}
        <div className="absolute top-1/4 right-1/6 w-32 h-32 rounded-full bg-black opacity-[0.03]"></div>
        <div className="absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full bg-black opacity-[0.02]"></div>
        <div className="absolute top-2/3 right-1/3 w-16 h-16 rounded-full bg-black opacity-[0.04]"></div>
        
        {/* Círculos de color muy sutiles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-red-600 opacity-[0.05] rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-green-600 opacity-[0.05] rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-yellow-500 opacity-[0.05] rounded-full blur-xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-title text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-3 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
        >
          Preguntas Frecuentes
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-700 text-center mb-10 max-w-3xl mx-auto"
        >
          Aquí encontrarás respuestas a las preguntas más comunes sobre nuestra rifa.
          Si tienes alguna duda adicional, no dudes en contactarnos.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Línea decorativa superior */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
            
            <div className="p-6">
              <Accordion className="divide-y divide-gray-100">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  >
                    <AccordionItem title={faq.question}>
                      <div className="hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <p className="text-gray-700 py-2 px-1">{faq.answer}</p>
                      </div>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
