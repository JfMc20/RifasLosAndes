import { toast } from 'sonner';

export const NotificationService = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description,
      duration: 5000, // Duración en milisegundos
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description,
      duration: 8000, // Errores visibles por más tiempo
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description: description,
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description,
      duration: 6000,
    });
  },

  custom: (component: React.ReactNode, options?: object) => {
    toast(component, options);
  }
};
