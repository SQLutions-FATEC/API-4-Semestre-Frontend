import type { UserLevel } from "./UserLevel";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: UserLevel; // Campo que o backend envia/recebe no JSON
}
