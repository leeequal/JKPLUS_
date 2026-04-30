
import React, { useState, useEffect, useMemo } from 'react';
import { Notice, NOTICES_DATA } from '../../user-app/data/notices';
import { AdminUser } from '../types';

const NoticeFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorName'>) => void;
    notice: Notice | null;
    defaultTarget: 'user' | 'employer';
}> = ({ isOpen, onClose, onSubmit, notice, defaultTarget }) => {
    const [title, setTitle] = useState(notice?.title || '');
    const [content, setContent] = useState(notice?.content || '');
    const [isPinned, setIsPinned] = useState(notice?.isPinned || false);
    const [target, setTarget] = useState<'user' | 'employer'>(notice?.target || defaultTarget);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (notice) {
                setTitle(notice.title);
                setContent(notice.content);
                setIsPinned(notice.isPinned);
                setTarget(notice.target);
            } else {
                setTitle('');
                setContent('');
                setIsPinned(false);
                setTarget(defaultTarget);
            }
        }
    }, [isOpen, notice, defaultTarget]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        onSubmit({ title, content, isPinned, target });
    };

    const commonInputClass = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 transition";

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 shrink-0">
                        <h3 className="text-lg font-semibold text-white">{notice ? '공지사항 수정' : '새 공지사항 작성'}</h3>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">대상</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="target" 
                                        value="user" 
                                        checked={target === 'user'} 
                                        onChange={() => setTarget('user')}
                                        className="h-4 w-4 text-amber-600 border-slate-500 focus:ring-amber-500 bg-slate-700"
                                    />
                                    <span className="ml-2 text-sm text-slate-300">근로자 (User)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="target" 
                                        value="employer" 
                                        checked={target === 'employer'} 
                                        onChange={() => setTarget('employer')}
                                        className="h-4 w-4 text-amber-600 border-slate-500 focus:ring-amber-500 bg-slate-700"
                                    />
                                    <span className="ml-2 text-sm text-slate-300">구인자 (Employer)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">제목</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={commonInputClass} required/>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">내용</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="공지 내용을 입력하세요" className={commonInputClass} rows={10} required/>
                        </div>
                        <div className="flex items-center bg-slate-900/30 p-3 rounded border border-slate-700">
                            <input id="isPinned" type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500" />
                            <label htmlFor="isPinned" className="ml-2 text-sm text-slate-300 font-medium cursor-pointer">중요 공지로 상단에 고정</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-800/50 rounded-b-xl border-t border-slate-700 shrink-0">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md">취소</button>
                        <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const NoticeManagement: React.FC<{currentUser: AdminUser}> = ({currentUser}) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [activeTab, setActiveTab] = useState<'user' | 'employer'>('user');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

    useEffect(() => {
        const storedNotices = localStorage.getItem('notices');
        // Migrate existing data (default to 'user' if target is missing)
        const parsedNotices = storedNotices ? JSON.parse(storedNotices) : NOTICES_DATA;
        const migratedNotices = parsedNotices.map((n: any) => ({
            ...n,
            target: n.target || 'user'
        }));
        setNotices(migratedNotices);
    }, []);

    useEffect(() => {
        localStorage.setItem('notices', JSON.stringify(notices));
    }, [notices]);

    const filteredNotices = useMemo(() => {
        return notices
            .filter(n => n.target === activeTab)
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [notices, activeTab]);

    const handleOpenModal = (notice: Notice | null) => {
        setEditingNotice(notice);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingNotice(null);
        setIsModalOpen(false);
    };

    const handleFormSubmit = (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorName'>) => {
        if (editingNotice) {
            setNotices(prev => prev.map(n => n.id === editingNotice.id ? { ...editingNotice, ...noticeData } : n));
        } else {
            const newNotice: Notice = {
                ...noticeData,
                id: `notice_${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
                authorName: currentUser.username,
            };
            setNotices(prev => [newNotice, ...prev]);
        }
        handleCloseModal();
    };
    
    const handleDeleteNotice = (id: string) => {
        if(window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            setNotices(prev => prev.filter(n => n.id !== id));
        }
    }

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">공지사항 관리</h2>
                    <p className="text-slate-400 mt-1">앱 사용자에게 표시될 공지사항을 작성하고 관리합니다.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition flex items-center gap-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    새 공지사항 추가
                </button>
            </div>

            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit mb-6">
                <button 
                    onClick={() => setActiveTab('user')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'user' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    근로자 앱 공지
                </button>
                <button 
                    onClick={() => setActiveTab('employer')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'employer' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    구인자 앱 공지
                </button>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden min-h-[300px]">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-3/5">제목</th>
                            <th scope="col" className="px-6 py-3">작성자</th>
                            <th scope="col" className="px-6 py-3">작성일</th>
                            <th scope="col" className="px-6 py-3 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotices.length > 0 ? filteredNotices.map(notice => (
                            <tr key={notice.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800 transition">
                                <td className="px-6 py-4 font-medium text-slate-100">
                                    <div className="flex items-center gap-2">
                                        {notice.isPinned && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30">중요</span>}
                                        {notice.title}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 truncate max-w-lg">{notice.content.substring(0, 60)}...</p>
                                </td>
                                <td className="px-6 py-4">{notice.authorName}</td>
                                <td className="px-6 py-4">{notice.createdAt}</td>
                                <td className="px-6 py-4 text-center space-x-3">
                                    <button onClick={() => handleOpenModal(notice)} className="font-medium text-sky-400 hover:text-sky-300 transition">수정</button>
                                    <span className="text-slate-600">|</span>
                                    <button onClick={() => handleDeleteNotice(notice.id)} className="font-medium text-red-400 hover:text-red-300 transition">삭제</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-slate-500">
                                    {activeTab === 'user' ? '근로자용' : '구인자용'} 공지사항이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <NoticeFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                notice={editingNotice}
                defaultTarget={activeTab}
            />
        </div>
    );
};
