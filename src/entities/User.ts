import type { UserLevel } from "./UserLevel";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: UserLevel; // Compatibilidade com backend (role)
  level?: UserLevel; // Compatibilidade retroativa (level)
}
