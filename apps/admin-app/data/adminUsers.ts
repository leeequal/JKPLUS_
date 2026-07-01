import { AdminUser } from '../types';

// NOTE: In a real application, passwords would be hashed. For this demo, they are plaintext.
export const ADMIN_USERS_DATA: AdminUser[] = [
    { 
        id: 'user-master',
        username: 'master', 
        password: '1', 
        role: 'master' 
    },
    {
        id: 'user-manager-a',
        username: 'manager_a',
        password: '123',
        role: 'manager',
        permissions: {
            canManageMembers: true,
            canManageSites: true,
            canManageDailyWork: true,
            canManageWages: false,
            canManageNotices: true,
        }
    },
    {
        id: 'user-manager-b',
        username: 'manager_b',
        password: '123',
        role: 'manager',
        permissions: {
            canManageMembers: true,
            canManageSites: false,
            canManageDailyWork: true,
            canManageWages: true,
            canManageNotices: true,
        }
    },
    {
        id: 'user-manager-c',
        username: 'manager_c',
        password: '123',
        role: 'manager',
        permissions: {
            canManageMembers: true,
            canManageSites: true,
            canManageDailyWork: false,
            canManageWages: true,
            canManageNotices: false,
        }
    }
];