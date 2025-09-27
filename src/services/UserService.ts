import api from "./api";
import type { User } from "@/mock/entities/user";

const userService = {
  get: (userId: number) => api.get<User>(`/user/${userId}`),
  getAll: () => api.get<User[]>("/user"),
  create: (payload: Omit<User, "id">) => api.post<User>("/user", payload),
  edit: (payload: User) => api.put<User>(`/user/${payload.id}`, payload),
  delete: (userId: number) => api.delete<void>(`/user/${userId}`),
};

export default userService;
