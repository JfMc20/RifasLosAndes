import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaTiktok } from 'react-icons/fa';

const SocialMediaBanner = () => {
  const socialLinks = [
    { name: 'RIFAS.LOSANDES', href: 'https://www.instagram.com/rifas.losandes', Icon: FaInstagram },
    { name: 'RIFASLOSANDES', href: 'https://www.tiktok.com/@rifaslosandes', Icon: FaTiktok },
  ];

  const MarqueeContent = () => (
    <div className="flex flex-shrink-0 items-center justify-center space-x-12 px-6">
      {socialLinks.map((link, i) => (
        <motion.a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 text-black font-bold text-lg tracking-wider"
          whileHover={{ scale: 1.05, color: '#333' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <link.Icon className="w-8 h-8" />
          <span>{link.name}</span>
        </motion.a>
      ))}
    </div>
  );

  return (
    <section className="bg-yellow-500 py-3 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-100%'] }}
        transition={{
          ease: 'linear',
          duration: 20,
          repeat: Infinity,
        }}
      >
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </motion.div>
    </section>
  );
};

export default SocialMediaBanner;
