<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { NotificationLog } from "@/entities/NotificationLog";
import NotificationReportModal from "@/components/Modals/NotificationReportModal.vue";
import notificationLogService from "@/services/NotificationLogService";
import dayjs from "dayjs";

const notifications = ref<NotificationLog[]>([]);
const loading = ref<boolean>(true);

const showReportModal = ref<boolean>(false);
const selectedNotification = ref<NotificationLog | null>(null);

const createCriticalNotification = async () => {
  try {
    const response = await notificationLogService.createTest();

    notifications.value.unshift(response.data);
  } catch (error) {
    console.error("Erro ao criar notificação crítica:", error);
    alert("Erro ao criar notificação crítica");
  }
};

// Buscar notificações do backend
const fetchNotifications = async (): Promise<void> => {
  try {
    loading.value = true;
    const response = await notificationLogService.getAll();
    notifications.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
    // Fallback para dados mockados em caso de erro
    notifications.value = getMockNotifications();
  } finally {
    loading.value = false;
  }
};

// Abrir modal de relatório
const openReportModal = (notification: NotificationLog): void => {
  selectedNotification.value = notification;
  showReportModal.value = true;
};

// Enviar relatório (UPDATE)
const handleReportSubmit = async (data: {
  reportText: string;
  completionDate: string;
}): Promise<void> => {
  if (!selectedNotification.value) return;

  try {
    const updateData = {
      id: selectedNotification.value.id,
      reportText: data.reportText,
      completionDate: data.completionDate,
    };

    const response = await notificationLogService.update(updateData);

    const updatedNotification = response.data;
    const notificationIndex = notifications.value.findIndex((n) => n.id === updatedNotification.id);

    if (notificationIndex !== -1) {
      notifications.value[notificationIndex] = updatedNotification;
    }

    console.log("Relatório atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar relatório:", error);
    alert("Erro ao salvar relatório. Tente novamente.");
  } finally {
    selectedNotification.value = null;
    showReportModal.value = false;
  }
};

// Dados mockados de fallback
const getMockNotifications = (): NotificationLog[] => {
  return [
    {
      id: 1,
      user: 1,
      messageText: "Alerta de temperatura alta detectada no servidor principal",
      reportText: "Problema resolvido com reinicialização do sistema de refrigeração",
      indexType: "Segurança",
      indexValue: 4,
      emissionDate: "2024-01-15T10:30:00",
      completionDate: "2024-01-15T11:45:00",
    },
    {
      id: 2,
      messageText: "Monitoramento de umidade normal com variações",
      reportText: "",
      indexType: "Volume",
      indexValue: 4,
      emissionDate: "2024-01-15T11:15:00",
    },
  ];
};

// Formatar data
const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleString("pt-BR");
};

// Verificar se está concluída
const isCompleted = (notification: NotificationLog): boolean => {
  return !!notification.completionDate;
};

// Cor baseada no status
const getStatusColor = (notification: NotificationLog): string => {
  return isCompleted(notification) ? "#22c55e" : "#eab308";
};

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <div class="home-container">
    <main class="home-content">
      <div class="main-content">
        <div class="page-header">
          <h1>Logs de Notificação</h1>
          <div class="stats">
            <span class="stat-item"> Total: {{ notifications.length }} </span>
            <span class="stat-item">
              Pendentes: {{ notifications.filter((n) => !n.completionDate).length }}
            </span>
            <span class="stat-item">
              Concluídas: {{ notifications.filter((n) => n.completionDate).length }}
            </span>
          </div>
        </div>

        <button class="btn-critical" @click="createCriticalNotification">
          🚨 Notificação Crítica
        </button>

        <div v-if="loading" class="loading">
          <p>Carregando notificações...</p>
        </div>

        <div v-else-if="notifications.length > 0" class="notifications-container">
          <div class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ completed: isCompleted(notification) }"
            >
              <div class="notification-header">
                <div class="notification-actions">
                  <button
                    v-if="!isCompleted(notification)"
                    class="btn-report"
                    @click.stop="openReportModal(notification)"
                  >
                    Fazer Relatório
                  </button>
                  <button class="btn-view" @click.stop="openReportModal(notification)">
                    {{ isCompleted(notification) ? "Ver Relatório" : "Editar" }}
                  </button>
                </div>
              </div>

              <div class="notification-body" @click="openReportModal(notification)">
                <p class="messageText-text">{{ notification.messageText }}</p>

                <div class="notification-details">
                  <span class="date-info">
                    Emissão: {{ formatDateTime(notification.emissionDate) }}
                  </span>
                  <span v-if="isCompleted(notification)" class="date-info">
                    Conclusão: {{ formatDateTime(notification.completionDate || "") }}
                  </span>
                </div>
              </div>

              <div class="notification-status">
                <span
                  class="status-badge"
                  :style="{ backgroundColor: getStatusColor(notification) }"
                >
                  {{ isCompleted(notification) ? "Concluída" : "Pendente" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-notifications">
          <p>Nenhuma notificação encontrada.</p>
        </div>
      </div>
    </main>

    <NotificationReportModal
      v-model="showReportModal"
      :original-message-text="selectedNotification?.messageText || ''"
      :initial-report-text="selectedNotification?.reportText || ''"
      :completion-date="selectedNotification?.completionDate || null"
      @submit="handleReportSubmit"
    />
  </div>
</template>

<style lang="scss" scoped src="@/Pages/notification/NotificationPageStyle.scss"></style>
