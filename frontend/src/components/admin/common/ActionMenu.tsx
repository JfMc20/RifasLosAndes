import React, { useState } from 'react';
import Link from 'next/link';

export interface ActionItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  buttonLabel?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, buttonLabel = 'Acciones' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonColorClass = (color?: string) => {
    switch (color) {
      case 'red': return 'text-red-600 hover:bg-red-50';
      case 'blue': return 'text-blue-600 hover:bg-blue-50';
      case 'green': return 'text-green-600 hover:bg-green-50';
      case 'yellow': return 'text-yellow-600 hover:bg-yellow-50';
      case 'primary': return 'text-primary hover:bg-blue-50';
      case 'indigo': return 'text-indigo-600 hover:bg-indigo-50';
      default: return 'text-gray-700 hover:bg-gray-50';
    }
  };

  // Función para manejar acciones con onClick
  const handleClick = (action: ActionItem) => {
    if (action.onClick && !action.disabled) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="dropdown inline-block relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded px-4 py-2 inline-flex items-center text-sm"
      >
        <span className="mr-1">{buttonLabel}</span>
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> 
        </svg>
      </button>

      {isOpen && (
        <div 
          className="dropdown-menu absolute right-0 mt-1 py-2 w-48 bg-white rounded-md shadow-xl z-50"
          style={{ minWidth: '12rem' }}
        >
          {actions.map((action, index) => {
            // Para acciones con enlace
            if (action.href && !action.disabled) {
              return (
                <Link 
                  key={index} 
                  href={action.href}
                  className={`block px-4 py-2 text-sm ${getButtonColorClass(action.color)}`}
                  onClick={() => setIsOpen(false)}
                >
                  {action.label}
                </Link>
              );
            }
            
            // Para acciones con función onClick
            return (
              <button
                key={index}
                onClick={() => handleClick(action)}
                disabled={action.disabled}
                className={`block text-left w-full px-4 py-2 text-sm ${getButtonColorClass(action.color)} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
