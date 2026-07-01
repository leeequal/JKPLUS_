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
        id: 'user-planner',
        username: 'planner',
        password: '123',
        role: 'manager',
        specialty: 'planner',
        permissions: {
            canManageMembers: true,
            canManageSites: true,
            canManageDailyWork: false,
            canManageWages: false,
            canManageNotices: true,
        }
    },
    {
        id: 'user-programmer',
        username: 'programmer',
        password: '123',
        role: 'manager',
        specialty: 'programmer',
        permissions: {
            canManageMembers: false,
            canManageSites: true,
            canManageDailyWork: true,
            canManageWages: false,
            canManageNotices: false,
        }
    },
    {
        id: 'user-tester',
        username: 'tester',
        password: '123',
        role: 'manager',
        specialty: 'tester',
        permissions: {
            canManageMembers: true,
            canManageSites: false,
            canManageDailyWork: true,
            canManageWages: true,
            canManageNotices: true,
        }
    }
];