import React, { useState } from 'react';
import { AdminUser } from '../types';
import { getManagerSpecialtyLabel } from '../utils/roleLabels';

interface PermissionManagementProps {
    users: AdminUser[];
    setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
}

export const PermissionManagement: React.FC<PermissionManagementProps> = ({ users, setUsers }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const managers = users.filter(u => u.role === 'manager');

    const handlePermissionChange = (userId: string, permission: keyof NonNullable<AdminUser['permissions']>, value: boolean) => {
        setUsers(currentUsers =>
            currentUsers.map(user => {
                if (user.id === userId && user.permissions) {
                    return { ...user, permissions: { ...user.permissions, [permission]: value } };
                }
                return user;
            })
        );
    };
    
    const handleDeleteUser = (userId: string) => {
        if (window.confirm("정말로 이 관리자를 삭제하시겠습니까?")) {
            setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newUsername.trim() || !newPassword.trim()) {
            return setError('아이디와 비밀번호를 모두 입력해주세요.');
        }
        if (users.some(u => u.username === newUsername.trim())) {
            return setError('이미 존재하는 아이디입니다.');
        }

        const newUser: AdminUser = {
            id: `user-${Date.now()}`,
            username: newUsername.trim(),
            password: newPassword.trim(),
            role: 'manager',
            permissions: { canManageMembers: false, canManageSites: false, canManageDailyWork: false, canManageWages: false, canManageNotices: false },
        };

        setUsers(currentUsers => [...currentUsers, newUser]);
        setNewUsername('');
        setNewPassword('');
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-100">권한 관리</h2>
                <p className="text-slate-400 mt-1">운영 관리자 계정을 생성하고, 각 시스템 메뉴에 대한 접근 권한을 관리합니다.</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">새 운영 관리자 추가</h3>
                <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="새 아이디"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500"
                        />
                    </div>
                    <div className="flex-1 w-full">
                         <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="초기 비밀번호"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500"
                        />
                    </div>
                    <button type="submit" className="w-full md:w-auto px-5 py-2 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition">
                        추가
                    </button>
                </form>
                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3">아이디</th>
                            <th className="px-6 py-3 text-center">담당 역할</th>
                            <th className="px-6 py-3 text-center">회원 관리</th>
                            <th className="px-6 py-3 text-center">현장 관리</th>
                            <th className="px-6 py-3 text-center">일일 출역 관리</th>
                            <th className="px-6 py-3 text-center">임금 정산 관리</th>
                            <th className="px-6 py-3 text-center">공지사항 관리</th>
                            <th className="px-6 py-3 text-center">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map(user => user.permissions && (
                            <tr key={user.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                <td className="px-6 py-4 font-medium text-slate-100">{user.username}</td>
                                <td className="px-6 py-4 text-center font-semibold text-slate-200">{getManagerSpecialtyLabel(user.specialty)}</td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={user.permissions.canManageMembers} onChange={e => handlePermissionChange(user.id, 'canManageMembers', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={user.permissions.canManageSites} onChange={e => handlePermissionChange(user.id, 'canManageSites', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={user.permissions.canManageDailyWork} onChange={e => handlePermissionChange(user.id, 'canManageDailyWork', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={user.permissions.canManageWages} onChange={e => handlePermissionChange(user.id, 'canManageWages', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={user.permissions.canManageNotices} onChange={e => handlePermissionChange(user.id, 'canManageNotices', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-red-400 hover:underline">삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {managers.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        등록된 운영 관리자가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};