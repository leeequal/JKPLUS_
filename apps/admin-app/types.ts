export interface AdminUserPermissions {
    canManageMembers: boolean;
    canManageSites: boolean;
    canManageDailyWork: boolean;
    canManageWages: boolean;
    canManageNotices: boolean;
}

export interface AdminUser {
    id: string;
    username: string;
    password?: string;
    role: 'master' | 'manager';
    permissions?: AdminUserPermissions;
}