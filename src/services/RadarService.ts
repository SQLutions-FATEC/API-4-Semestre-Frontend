import api from "./api";
import type { Radar } from "@/mock/entities/radar";

const radarService = {
  get: (radarId: string) => api.get<Radar>(`/radar/${radarId}`),
  getAll: () => api.get<Radar[]>("/radar"),
  create: (payload: Omit<Radar, "id">) => api.post<Radar>("/radar", payload),
  edit: (payload: Radar) => api.put<Radar>(`/radar/${payload.id}`, payload),
  delete: (radarId: string) => api.delete<void>(`/radar/${radarId}`),
};

export default radarService;
