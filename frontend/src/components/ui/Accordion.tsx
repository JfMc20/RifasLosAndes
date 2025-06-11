import React, { useState, ReactNode } from 'react';

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => {
  return (
    <div className={`divide-y divide-gray-100 ${className}`}>
      {children}
    </div>
  );
};

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="py-4">
      <button
        className="flex justify-between items-center w-full text-left py-2 px-1 hover:text-red-600 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-title text-lg font-medium text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 text-yellow-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="py-3 px-1">{children}</div>
      </div>
    </div>
  );
};

// Exportamos los componentes individualmente
export { Accordion, AccordionItem };
