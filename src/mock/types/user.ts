import type { UserLevel } from "./UserLevel";

export interface User {
  id: number;
  name: string;
  level: UserLevel;
  email: string;
  password: string;
}
