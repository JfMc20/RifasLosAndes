import React from 'react';
import Link from 'next/link';

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  color?: string;
}

const ActionButtons: React.FC<{ actions: ActionButtonProps[] }> = ({ actions }) => {
  // Función para obtener las clases según el color
  const getColorClasses = (color?: string) => {
    switch(color) {
      case 'red': return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'green': return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'blue': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'primary': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {actions.map((action, index) => {
        if (action.href) {
          // Para acciones con navegación (href)
          return (
            <Link 
              key={index}
              href={action.href}
              className={`px-2 py-1 rounded text-xs font-medium ${getColorClasses(action.color)}`}
            >
              {action.label}
            </Link>
          );
        } else {
          // Para acciones con onClick
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-2 py-1 rounded text-xs font-medium ${getColorClasses(action.color)}`}
            >
              {action.label}
            </button>
          );
        }
      })}
    </div>
  );
};

export default ActionButtons;
