import type { NotificationLog } from "@/entities/NotificationLog";
import type { AxiosResponse } from "axios";
import api from "./api";

const notificationLogService = {
  get: (logId: number): Promise<AxiosResponse<NotificationLog>> => api.get(`/logs/${logId}`),

  getAll: (): Promise<AxiosResponse<NotificationLog[]>> => api.get("/logs"),

  create: (payload: Omit<NotificationLog, "id">): Promise<AxiosResponse<NotificationLog>> =>
    api.post("/logs", payload),

  update: (
    logId: number,
    payload: Partial<NotificationLog>
  ): Promise<AxiosResponse<NotificationLog>> => api.put(`/logs/${logId}`, payload),

  delete: (logId: number): Promise<AxiosResponse<void>> => api.delete(`/logs/${logId}`),
};

export default notificationLogService;
