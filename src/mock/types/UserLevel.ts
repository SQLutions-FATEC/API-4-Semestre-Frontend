export enum UserLevel {
  ADMIN = 'Admin',
  MANAGER = 'Gestor'
}

export const UserLevelLabel: Record<UserLevel, string> = {
  [UserLevel.ADMIN]: 'Administrador',
  [UserLevel.MANAGER]: 'Gestor'
};