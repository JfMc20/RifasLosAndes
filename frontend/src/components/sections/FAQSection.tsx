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
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-title font-bold text-black drop-shadow-md text-3xl sm:text-4xl md:text-5xl mb-3">
            Preguntas Frecuentes
          </h2>
          <p className="text-yellow-600 drop-shadow text-sm sm:text-base max-w-3xl mx-auto font-medium">
            Aquí encontrarás respuestas a las preguntas más comunes sobre nuestra rifa. Si tienes alguna duda adicional, no dudes en contactarnos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden">
            {/* Aquí se aumentó la altura de la línea dorada de h-2 a h-4 */}
            <div className="h-2 bg-yellow-500"></div>

            <div className="p-1 md:p-2">
              <Accordion className="divide-y divide-gray-200/80">
                {faqs.map((faq) => (
                  <AccordionItem key={faq._id} title={faq.question}>
                    <div className="py-2 px-4 bg-gray-50/80">
                      <p className="text-gray-700 text-sm md:text-base">{faq.answer}</p>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
export default FAQSection;