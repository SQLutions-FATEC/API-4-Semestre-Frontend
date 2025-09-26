import type { UserLevel } from './userLevel';

export interface User {
  id: number;
  name: string;
  level: UserLevel;
  email: string;
  password: string;
}
