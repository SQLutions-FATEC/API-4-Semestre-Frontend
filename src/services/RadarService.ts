import api from "./api";
import type { Radar } from "@/entities/Radar.ts";

const radarService = {
  get: (radarId: string) => api.get<Radar>(`/radars/${radarId}`),
  getAll: () => api.get<Radar[]>("/radars"),
  create: (payload: Omit<Radar, "id">) => api.post<Radar>("/radars", payload),
  edit: (payload: Radar) => api.put<Radar>(`/radars/${payload.id}`, payload),
  delete: (radarId: string) => api.delete<void>(`/radars/${radarId}`),
};

export default radarService;
