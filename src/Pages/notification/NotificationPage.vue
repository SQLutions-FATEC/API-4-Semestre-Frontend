<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { NotificationLog } from "@/entities/NotificationLog";
import NotificationReportModal from "@/components/Modals/NotificationReportModal.vue";

const notifications = ref<NotificationLog[]>([]);
const loading = ref<boolean>(true);

const showReportModal = ref<boolean>(false);
const selectedNotification = ref<NotificationLog | null>(null);

const openReportModal = (notification: NotificationLog): void => {
  selectedNotification.value = notification;
  showReportModal.value = true;
};

const handleReportSubmit = async (data: {
  reportText: string;
  completionDate: string;
}): Promise<void> => {
  if (!selectedNotification.value) return;

  try {
    console.log("Enviando relatório para o backend:", {
      notificationId: selectedNotification.value.id,
      reportText: data.reportText,
      completedAt: data.completionDate,
    });

    // Atualiza a notificação localmente
    const notificationIndex = notifications.value.findIndex(
      (n) => n.id === selectedNotification.value!.id
    );

    if (notificationIndex !== -1) {
      notifications.value[notificationIndex] = {
        ...notifications.value[notificationIndex],
        reportText: data.reportText,
        completionDate: data.completionDate,
      };
    }

    //TODO
    // await api.updateNotification(selectedNotification.value.id, {
    //   reportText: data.reportText,
    //   completedAt: data.completedAt

    console.log("Relatório atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar relatório:", error);
  } finally {
    selectedNotification.value = null;
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    notifications.value = [
      {
        id: 1,
        message: "Alerta de temperatura alta detectada no servidor principal",
        reportText: "Problema resolvido com reinicialização do sistema de refrigeração", // Relatório já feito
        indexType: "Segurança",
        indexValue: 3,
        emissionDate: "2024-01-15T10:30:00",
        completionDate: "2024-01-15T11:45:00",
      },
      {
        id: 2,
        message: "Monitoramento de umidade normal com variações",
        reportText: "",
        indexType: "Volume",
        indexValue: 5,
        emissionDate: "2024-01-15T11:15:00",
      },
    ];
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
  } finally {
    loading.value = false;
  }
});

const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleString("pt-BR");
};

const getLevelColor = (indexValue: number): string => {
  const colors = [
    "#22c55e", // nível 1 - verde
    "#84cc16", // nível 2
    "#eab308", // nível 3
    "#f97316", // nível 4
    "#dc2626", // nível 5 - vermelho
  ];
  return colors[indexValue - 1] || "#6b7280";
};
</script>

<template>
  <div class="home-container">
    <main class="home-content">
      <div class="main-content">
        <div v-if="loading" class="loading">
          <p>Carregando notificações...</p>
        </div>

        <div v-else-if="notifications.length > 0" class="notifications-container">
          <h1>Notificações</h1>

          <div class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              @click="openReportModal(notification)"
            >
              <div class="notification-header">
                <p class="message-text">
                  {{ notification.message }}
                </p>
              </div>

              <div class="notification-info">
                <span class="index-type"> {{ notification.indexType }}</span>
                <span class="index-value"> - Nível: {{ notification.indexValue || "N/A" }}</span>
                <span class="start-date"
                  >Início: {{ formatDateTime(notification.emissionDate) }}</span
                >
                <span class="notification-level">
                  <span
                    class="level-indicator"
                    :style="{ backgroundColor: getLevelColor(notification.indexValue) }"
                    :title="`Nível ${notification.indexValue}`"
                  ></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-notifications">
          <h1>Logs de Notificação</h1>
          <p>Nenhum registro de notificação encontrado.</p>
        </div>
      </div>
    </main>

    <NotificationReportModal
      v-model="showReportModal"
      :original-message="selectedNotification?.message || ''"
      :initial-report-text="selectedNotification?.reportText || ''"
      :completed-at="selectedNotification?.completionDate || ''"
      @submit="handleReportSubmit"
    />
  </div>
</template>

<style lang="scss" scoped src="@/Pages/notification/NotificationPageStyle.scss"></style>
