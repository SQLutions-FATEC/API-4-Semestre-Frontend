import api from "./api";
import type { User } from "@/entities/User";

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string; // Opcional na edição
  role?: string;
}

const userService = {
  get: (userId: number) => api.get<User>(`/users/${userId}`),
  getAll: () => api.get<User[]>("/users"),
  create: (payload: Omit<CreateUserPayload, 'role'>) => {
    const createPayload: CreateUserPayload = {
      ...payload,
      role: "Gestor"
    };
    return api.post<User>("/users", createPayload);
  },
  update: (userId: number, payload: UpdateUserPayload) => {
    const updatePayload: UpdateUserPayload = {
      ...payload,
      role: payload.role || "Gestor"
    };
    return api.put<User>(`/users/${userId}`, updatePayload);
  },
  delete: (userId: number) => api.delete<void>(`/users/${userId}`),
};

export default userService;
