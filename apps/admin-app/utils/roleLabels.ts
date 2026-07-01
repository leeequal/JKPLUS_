import { AdminUser } from '../types';

export const getManagerSpecialtyLabel = (specialty?: AdminUser['specialty']) => {
    switch (specialty) {
        case 'planner':
            return '플래너';
        case 'programmer':
            return '프로그래머';
        case 'tester':
            return '테스터';
        default:
            return '운영자';
    }
};

export const getUserRoleLabel = (user: AdminUser) => {
    if (user.role === 'master') {
        return '프로젝트 Master (총괄/조율)';
    }
    return getManagerSpecialtyLabel(user.specialty);
};
