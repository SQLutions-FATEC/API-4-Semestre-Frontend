import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/users/login', credentials);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          throw new Error('Credenciais inválidas');
        } else if (axiosError.response?.status === 400) {
          throw new Error('Dados de login inválidos');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
    }
  }

  /**
   * Salva o token no localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Recupera o token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Remove o token do localStorage
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Salva os dados do usuário no localStorage
   */
  saveUserData(userData: Omit<LoginResponse, 'token' | 'type'>): void {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  /**
   * Recupera os dados do usuário do localStorage
   */
  getUserData(): Omit<LoginResponse, 'token' | 'type'> | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Remove os dados do usuário do localStorage
   */
  removeUserData(): void {
    localStorage.removeItem('user_data');
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userData = this.getUserData();

    if (!token || !userData) {
      return false;
    }

    // Verifica se o token não expirou (básico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        // Token expirado, remove dados
        this.removeToken();
        this.removeUserData();
        return false;
      }
    } catch (error) {
      // Token inválido
      this.removeToken();
      this.removeUserData();
      return false;
    }

    return true;
  }

  /**
   * Realiza logout completo
   */
  logout(): void {
    this.removeToken();
    this.removeUserData();
  }
}

export default new AuthService();
