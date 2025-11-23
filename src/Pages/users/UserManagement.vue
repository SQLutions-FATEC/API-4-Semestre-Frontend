<template>
  <div class="user-management">
    <header class="user-management-header">
      <h1 class="page-title">Gerir Usuários</h1>
      <button class="btn-primary" @click="openCreateModal">
        <span class="icon">+</span>
        Adicionar Usuário
      </button>
    </header>

    <div class="user-list-container">
      <div class="user-table">
        <div class="table-header">
          <div class="header-cell">ID</div>
          <div class="header-cell">Nome</div>
          <div class="header-cell">Email</div>
          <div class="header-cell">Ações</div>
        </div>

        <div class="table-body">
          <div v-for="user in users" :key="user.id" class="table-row">
            <div class="table-cell" data-label="ID">{{ user.id }}</div>
            <div class="table-cell" data-label="Nome">{{ user.name }}</div>
            <div class="table-cell" data-label="Email">{{ user.email }}</div>
            <div class="table-cell actions-cell" data-label="Ações">
              <button
                title="Editar usuário"
                class="btn-action btn-edit"
                @click="openEditModal(user)"
              >
                <span class="icon">✏️</span>
              </button>
              <button
                title="Excluir usuário"
                class="btn-action btn-delete"
                @click="openDeleteModal(user)"
              >
                <span class="icon">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="users.length === 0" class="empty-state">
        <p>Nenhum usuário encontrado</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Carregando usuários...</p>
    </div>

    <!-- Modal de Criação/Edição de Usuário -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEditMode ? 'Editar Usuário' : 'Criar Usuário' }}
          </h3>
          <button class="modal-close-button" type="button" @click="closeUserModal">
            ×
          </button>
        </div>

        <form class="user-form" @submit.prevent="handleUserSubmit">
          <div class="form-group">
            <label for="username" class="form-label">Nome de usuário:</label>
            <input
              id="username"
              v-model="userForm.name"
              type="text"
              class="form-input"
              placeholder="Digite o nome de usuário"
              :disabled="isSubmitting"
              required
            />
          </div>

          <div class="form-group">
            <label for="userEmail" class="form-label">Email:</label>
            <input
              id="userEmail"
              v-model="userForm.email"
              type="email"
              class="form-input"
              placeholder="Digite o email"
              :disabled="isSubmitting"
              required
            />
          </div>

          <div class="form-group">
            <label for="userPassword" class="form-label">Senha:</label>
            <input
              id="userPassword"
              v-model="userForm.password"
              type="password"
              class="form-input"
              :placeholder="isEditMode ? 'Deixe vazio para manter a atual' : 'Digite a senha'"
              :disabled="isSubmitting"
              :required="!isEditMode"
            />
          </div>

          <div v-if="userError" class="error-message">
            {{ userError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" :disabled="isSubmitting" @click="closeUserModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">{{ isEditMode ? 'Salvando...' : 'Criando...' }}</span>
              <span v-else>{{ isEditMode ? 'Salvar Alterações' : 'Criar Usuário' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-delete" @click.stop>
        <div class="modal-header modal-header-delete">
          <h3 class="modal-title">Confirmar Exclusão</h3>
          <button class="modal-close-button" type="button" @click="closeDeleteModal">
            ×
          </button>
        </div>

        <div class="delete-content">
          <div class="delete-icon">
            <span class="icon">🗑️</span>
          </div>
          <p class="delete-message">
            Tem certeza que deseja excluir o usuário
            <strong>{{ userToDelete?.name }}</strong>?
          </p>
          <p class="delete-warning">
            Esta ação não pode ser desfeita.
          </p>

          <div v-if="deleteError" class="error-message">
            {{ deleteError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" :disabled="isDeleting" @click="closeDeleteModal">
              Não
            </button>
            <button type="button" class="btn-danger" :disabled="isDeleting" @click="handleDeleteConfirm">
              <span v-if="isDeleting">Excluindo...</span>
              <span v-else>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User } from '@/entities/User';
import { UserLevel } from '@/entities/UserLevel';

// Estado da página
const users = ref<User[]>([]);
const loading = ref(false);

// Estado dos modais
const showUserModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);

// Formulários e dados
const userForm = ref({
  name: '',
  email: '',
  password: ''
});

const userToDelete = ref<User | null>(null);
const editingUserId = ref<number | null>(null);

// Mensagens de erro
const userError = ref('');
const deleteError = ref('');

// Mock data para visualização
const mockUsers: User[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@email.com',
    password: '********',
    level: UserLevel.MANAGER
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    password: '********',
    level: UserLevel.MANAGER
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    password: '********',
    level: UserLevel.MANAGER
  }
];

// Modais
const openCreateModal = () => {
  isEditMode.value = false;
  editingUserId.value = null;
  userForm.value = {
    name: '',
    email: '',
    password: ''
  };
  userError.value = '';
  showUserModal.value = true;
};

const openEditModal = (user: User) => {
  isEditMode.value = true;
  editingUserId.value = user.id;
  userForm.value = {
    name: user.name,
    email: user.email,
    password: '' // Sempre deixar vazio para segurança
  };
  userError.value = '';
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  userError.value = '';
  userForm.value = {
    name: '',
    email: '',
    password: ''
  };
  isEditMode.value = false;
  editingUserId.value = null;
};

const openDeleteModal = (user: User) => {
  userToDelete.value = user;
  deleteError.value = '';
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  userToDelete.value = null;
  deleteError.value = '';
};

// Handlers dos formulários
const handleUserSubmit = async () => {
  if (isSubmitting.value) return;

  userError.value = '';
  isSubmitting.value = true;

  try {
    // Validações básicas
    if (!userForm.value.name.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }
    if (!userForm.value.email.trim()) {
      throw new Error('Email é obrigatório');
    }
    if (!isEditMode.value && !userForm.value.password.trim()) {
      throw new Error('Senha é obrigatória');
    }

    // Simular operação
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isEditMode.value) {
      // Simular edição
      const userIndex = users.value.findIndex(u => u.id === editingUserId.value);
      if (userIndex !== -1) {
        users.value[userIndex] = {
          ...users.value[userIndex],
          name: userForm.value.name,
          email: userForm.value.email,
          // Só atualizar senha se foi fornecida
          ...(userForm.value.password && { password: '********' })
        };
      }
    } else {
      // Simular criação
      const newUser: User = {
        id: Math.max(...users.value.map(u => u.id), 0) + 1,
        name: userForm.value.name,
        email: userForm.value.email,
        password: '********',
        level: UserLevel.MANAGER
      };
      users.value.push(newUser);
    }

    closeUserModal();
  } catch (error) {
    if (error instanceof Error) {
      userError.value = error.message;
    } else {
      userError.value = 'Erro inesperado. Tente novamente.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (isDeleting.value || !userToDelete.value) return;

  deleteError.value = '';
  isDeleting.value = true;

  try {
    // Simular operação de exclusão
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remover usuário da lista
    users.value = users.value.filter(u => u.id !== userToDelete.value!.id);

    closeDeleteModal();
  } catch (error) {
    if (error instanceof Error) {
      deleteError.value = error.message;
    } else {
      deleteError.value = 'Erro inesperado. Tente novamente.';
    }
  } finally {
    isDeleting.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  // Simular carregamento
  setTimeout(() => {
    users.value = mockUsers;
    loading.value = false;
  }, 1000);
});
</script>

<style scoped lang="scss">
@use "@/styles/__colors.module.scss" as colors;
@use "@/styles/__spacers.module.scss" as spacers;
@use "@/styles/__mixins.module.scss" as mixins;
@use "@/styles/__fonts.module.scss" as fonts;

.user-management {
  padding: spacers.$contentPadding;
  max-width: spacers.$contentMaxWidth;
  margin: 0 auto;
  min-height: calc(100vh - #{spacers.$headerHeight});

  @media (max-width: 768px) {
    padding: spacers.$contentPaddingMobile;
  }
}

.user-management-header {
  @include mixins.flex-between;
  margin-bottom: spacers.$spacingXxl;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: spacers.$spacingLg;
    align-items: stretch;
  }
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: colors.$colorPrimary;
  margin: 0;
}

.btn-primary {
  @include mixins.flex-center;
  gap: spacers.$spacingSm;
  padding: spacers.$spacingMd spacers.$spacingLg;
  background: linear-gradient(135deg, colors.$colorPrimary, #0284c7);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  .icon {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(colors.$colorPrimary, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.user-list-container {
  position: relative;
}

.user-table {
  background: colors.$colorBackgroundWhite;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid colors.$colorBorderGray;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 120px;
  background: colors.$colorBackgroundLightBlue;
  padding: spacers.$spacingLg;
  font-weight: 600;
  color: colors.$colorPrimary;
  border-bottom: 2px solid colors.$colorBorderGray;

  @media (max-width: 768px) {
    display: none;
  }
}

.header-cell {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  .table-row {
    display: grid;
    grid-template-columns: 80px 1fr 1fr 120px;
    padding: spacers.$spacingLg;
    border-bottom: 1px solid colors.$colorBorderGray;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: colors.$colorBackgroundHover;
    }

    &:last-child {
      border-bottom: none;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: spacers.$spacingSm;
      padding: spacers.$spacingLg spacers.$spacingMd;

      .table-cell {
        display: flex;
        justify-content: space-between;

        &:before {
          content: attr(data-label);
          font-weight: 600;
          color: colors.$colorPrimary;
        }
      }
    }
  }
}

.table-cell {
  @include mixins.flex-center;
  justify-content: flex-start;
  font-size: 0.95rem;
  color: #374151;

  &:first-child {
    font-weight: 600;
    color: colors.$colorPrimary;
  }
}

.actions-cell {
  @include mixins.flex-center;
  gap: spacers.$spacingSm;
  justify-content: center;

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
}

.btn-action {
  @include mixins.flex-center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  .icon {
    font-size: 1rem;
  }

  &:hover {
    transform: scale(1.1);
  }
}

.btn-edit {
  background: colors.$colorStatusYellow;
  color: white;

  &:hover {
    background: #ca8a04;
  }
}

.btn-delete {
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
  }
}

.empty-state {
  @include mixins.flex-column-center;
  padding: spacers.$spacingXxl;
  color: colors.$colorStatusGray;
  font-size: 1.1rem;
}

.loading-overlay {
  @include mixins.flex-column-center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  gap: spacers.$spacingLg;
  color: colors.$colorPrimary;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid colors.$colorBackgroundLight;
  border-top: 4px solid colors.$colorPrimary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: colors.$colorBackgroundWhite;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 480px) {
    min-width: 300px;
    margin: spacers.$spacingLg;
  }
}

.modal-delete {
  max-width: 500px;
}

.modal-header {
  @include mixins.flex-between;
  padding: spacers.$spacingLg;
  border-bottom: 1px solid colors.$colorBorderGray;
  background: linear-gradient(135deg, colors.$colorPrimary, #0284c7);
  border-radius: 12px 12px 0 0;
}

.modal-header-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.modal-title {
  color: white;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  @include mixins.flex-center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.user-form {
  padding: spacers.$spacingLg;
  display: flex;
  flex-direction: column;
  gap: spacers.$spacingMd;
}

.form-group {
  @include mixins.flex-column;
  gap: spacers.$spacingSm;
}

.form-label {
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  padding: spacers.$spacingMd;
  border: 1px solid colors.$colorBorderGray;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: colors.$colorPrimary;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.7;
    background-color: colors.$colorBackgroundHover;
    cursor: not-allowed;
  }
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  padding: spacers.$spacingSm spacers.$spacingMd;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border-left: 4px solid #ef4444;
}

.modal-actions {
  @include mixins.flex-between;
  gap: spacers.$spacingMd;
  margin-top: spacers.$spacingLg;

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}

.btn-secondary {
  padding: spacers.$spacingMd spacers.$spacingLg;
  background: colors.$colorBackgroundLight;
  color: #374151;
  border: 1px solid colors.$colorBorderGray;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: colors.$colorBackgroundHover;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-danger {
  padding: spacers.$spacingMd spacers.$spacingLg;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
}

.delete-content {
  padding: spacers.$spacingLg;
  @include mixins.flex-column-center;
  text-align: center;
  gap: spacers.$spacingMd;
}

.delete-icon {
  @include mixins.flex-center;
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  margin-bottom: spacers.$spacingMd;

  .icon {
    font-size: 2rem;
  }
}

.delete-message {
  font-size: 1.1rem;
  color: #374151;
  margin: 0;

  strong {
    color: colors.$colorPrimary;
    font-weight: 600;
  }
}

.delete-warning {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

// Responsive design melhorias
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 1fr 100px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
