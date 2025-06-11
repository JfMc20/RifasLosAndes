import { ApiService } from './api';
import { User } from '../types';

// Interfaz específica para el registro de usuarios
interface RegisterUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

// Interfaces para las respuestas de la API de autenticación
interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Servicio para gestionar usuarios en el panel de administración
 */
export class UserService {
  /**
   * Obtiene todos los usuarios
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await ApiService.get<User[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  /**
   * Obtiene un usuario por su ID
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
      const response = await ApiService.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${userId}:`, error);
      return null;
    }
  }

  /**
   * Crea un nuevo usuario usando la ruta de registro de autenticación
   */
  static async createUser(userData: RegisterUserDto): Promise<User> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/register', userData);
      return response.data.user;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const response = await ApiService.put<User>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${userId}:`, error);
      return null;
    }
  }

  /**
   * Elimina un usuario
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.delete<{ success: boolean; message: string }>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${userId}:`, error);
      return { 
        success: false, 
        message: 'No se pudo eliminar el usuario. Verifique los permisos.' 
      };
    }
  }

  /**
   * Cambia la contraseña de un usuario
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>(`/users/${userId}/change-password`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar la contraseña del usuario ${userId}:`, error);
      return {
        success: false,
        message: 'No se pudo cambiar la contraseña. Verifique que la contraseña actual sea correcta.'
      };
    }
  }
  
  /**
   * Actualiza el perfil del usuario autenticado
   */
  static async updateProfile(
    profileData: Partial<User>
  ): Promise<User | null> {
    try {
      const response = await ApiService.put<User>('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      return null;
    }
  }
}
