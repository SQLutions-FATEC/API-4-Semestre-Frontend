import { ref, computed } from 'vue';
import AuthService, { type LoginRequest, type LoginResponse } from '@/services/AuthService';

// Authentication state
const isAuthenticated = ref<boolean>(AuthService.isAuthenticated());
const currentUser = ref<Omit<LoginResponse, 'token' | 'type'> | null>(AuthService.getUserData());
const isLoading = ref<boolean>(false);

export function useAuth() {
  /**
   * Realiza login
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await AuthService.login(credentials);

      AuthService.saveToken(response.token);

      const userData = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      };

      AuthService.saveUserData(userData);

      isAuthenticated.value = true;
      currentUser.value = userData;

    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Realiza logout
   */
  const logout = (): void => {
    AuthService.logout();
    isAuthenticated.value = false;
    currentUser.value = null;
  };

  /**
   * Inicializa o estado de autenticação
   * Deve ser chamado na inicialização da aplicação
   */
  const initializeAuth = (): void => {
    isAuthenticated.value = AuthService.isAuthenticated();
    currentUser.value = AuthService.getUserData();
  };

  /**
   * Verifica se o usuário é gestor
   */
  const isManager = computed(() => {
    return currentUser.value?.role?.name === 'GESTOR';
  });

  /**
   * Obtém o nome do usuário atual
   */
  const userName = computed(() => {
    return currentUser.value?.name || '';
  });

  /**
   * Obtém o email do usuário atual
   */
  const userEmail = computed(() => {
    return currentUser.value?.email || '';
  });

  return {
    // State
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    isLoading: computed(() => isLoading.value),

    // Computed
    isManager,
    userName,
    userEmail,

    // Actions
    login,
    logout,
    initializeAuth
  };
}
