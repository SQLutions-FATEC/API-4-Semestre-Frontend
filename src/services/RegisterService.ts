import api from "./api";
import type { Register } from "@/mock/entities/Register";

const registerService = {
  get: (registerId: number) => api.get<Register>(`/register/${registerId}`),
  getAll: () => api.get<Register[]>("/register"),
  create: (payload: Omit<Register, "id">) => api.post<Register>("/register", payload),
  edit: (payload: Register) => api.put<Register>(`/register/${payload.id}`, payload),
  delete: (registerId: number) => api.delete<void>(`/register/${registerId}`),
};

export default registerService;
