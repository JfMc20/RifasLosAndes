import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="border-t-2 border-yellow-500"></div>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="font-title text-3xl font-bold text-white mb-2">Rifas Los Andes</h2>
          <p className="text-gray-400 max-w-md mx-auto">
          Adquiere tu número por $30 y participa por un Toyota Corolla 2020.
          Una oportunidad real, estés donde estés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left mb-8">
          <div className="mx-auto">
            <h3 className="font-title text-xl font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="#tickets" className="hover:text-yellow-400 transition-colors">Números Disponibles</Link></li>
              <li><Link href="#payment-methods" className="hover:text-yellow-400 transition-colors">Métodos de Pago</Link></li>
              <li><Link href="#faq" className="hover:text-yellow-400 transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
          <div className="mx-auto">
            <h3 className="font-title text-xl font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaEnvelope className="text-yellow-500" />
                <a href="mailto:info@rifalosandes.com" className="hover:text-yellow-400 transition-colors">info@rifalosandes.com</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaWhatsapp className="text-yellow-500" />
                <a href="https://wa.me/PHONE_NUMBER_HERE" className="hover:text-yellow-400 transition-colors">Contáctanos por WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
            <FaInstagram size={28} />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
            <FaTiktok size={28} />
          </a>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Rifas Los Andes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
