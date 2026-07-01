export interface AdminUserPermissions {
    canManageMembers: boolean;
    canManageSites: boolean;
    canManageDailyWork: boolean;
    canManageWages: boolean;
    canManageNotices: boolean;
}

export type ManagerSpecialty = 'planner' | 'programmer' | 'tester';

export interface AdminUser {
    id: string;
    username: string;
    password?: string;
    role: 'master' | 'manager';
    specialty?: ManagerSpecialty;
    permissions?: AdminUserPermissions;
}