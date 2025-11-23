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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User } from '@/entities/User';
import { UserLevel } from '@/entities/UserLevel';

// Estado da página
const users = ref<User[]>([]);
const loading = ref(false);

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
  // TODO: Implementar modal de criação
};

const openEditModal = (user: User) => {
  // TODO: Implementar modal de edição
  void user;
};

const openDeleteModal = (user: User) => {
  // TODO: Implementar modal de exclusão
  void user;
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
