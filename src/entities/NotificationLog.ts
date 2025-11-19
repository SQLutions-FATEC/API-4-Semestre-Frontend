export interface NotificationLog {
  id: number;
  messageText: string;
  chatId: string;
  success: boolean;
  errorDetails: string | null;
  indexType: string;
  indexValue: number | null;
  startAt: string | null;
  completedAt: string | null;
}
