import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ActionItem {
  label: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  label?: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ 
  actions,
  label = 'Acciones'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action: ActionItem) => {
    setIsOpen(false);
    
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  // Clases de color según el tipo de acción
  const getColorClasses = (color?: string) => {
    switch(color) {
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'yellow': return 'text-yellow-600';
      case 'indigo': return 'text-indigo-600';
      case 'primary': return 'text-blue-600';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón que abre el menú */}
      <button
        type="button"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg className="w-4 h-4 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div 
          className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg" 
          style={{ minWidth: '160px' }}
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`${getColorClasses(action.color)} hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm`}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
