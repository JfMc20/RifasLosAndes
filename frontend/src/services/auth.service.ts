import { ApiService } from './api';
import { User } from '../types';


interface LoginResponse {
  user: User;
  accessToken: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_KEY = 'authUser';

  /**
   * Iniciar sesión en el panel de administración
   */
  static async login(username: string, password: string): Promise<User> {
    try {
      const response = await ApiService.post<LoginResponse>('auth/login', { username, password });
      
      // Guardar token y datos de usuario en localStorage
      localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión y eliminar datos almacenados
   */
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener el token de autenticación
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener datos del usuario actualmente autenticado
   */
  static getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario tiene rol de administrador
   */
  static isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'admin';
  }

  /**
   * Obtener información del perfil del usuario actual
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await ApiService.get<User>('auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
