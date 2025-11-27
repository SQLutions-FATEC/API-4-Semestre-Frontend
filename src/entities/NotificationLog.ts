import type { User } from "./User";
export interface NotificationLog {
  id: number;
  user?: User["id"];
  message: string;
  reportText?: string;
  indexType: string;
  indexValue: number;
  emissionDate: string;
  completionDate?: string;
}

export type NotificationLogUpdate = Partial<
  Omit<NotificationLog, "id" | "user" | "reportText" | "completionDate">
>;
