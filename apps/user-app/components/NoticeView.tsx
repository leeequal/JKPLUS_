
import React, { useState, useEffect, useMemo } from 'react';
import { Notice, NOTICES_DATA } from '../data/notices';

export const NoticeView: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

    useEffect(() => {
        const storedNotices = localStorage.getItem('notices');
        // Use initial data as a fallback if nothing is in localStorage
        const initialData = storedNotices ? JSON.parse(storedNotices) : NOTICES_DATA;
        setNotices(initialData);

        // Filter for user notices
        const userNotices = initialData.filter((n: Notice) => n.target === 'user' || !n.target); // Default to user if target is missing

        // If there are notices, expand the first pinned one by default
        const firstPinned = userNotices.find((n: Notice) => n.isPinned);
        if (firstPinned) {
            setExpandedNoticeId(firstPinned.id);
        } else if (userNotices.length > 0) {
            // Or just expand the very first one
            setExpandedNoticeId(userNotices[0].id);
        }

    }, []);

    const sortedNotices = useMemo(() => {
        return [...notices]
            .filter(n => n.target === 'user' || !n.target)
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [notices]);

    const handleToggleNotice = (id: string) => {
        setExpandedNoticeId(prevId => (prevId === id ? null : id));
    };

    if (sortedNotices.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.136a1.76 1.76 0 011.176-2.311l8.65-3.071a1.76 1.76 0 012.311 1.176l2.147 6.136a1.76 1.76 0 01-.592 3.417l-9.23 3.322" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-300">등록된 공지사항 없음</h3>
                <p className="mt-1 text-sm text-slate-500">
                    아직 새로운 소식이 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedNotices.map((notice) => {
                const isExpanded = expandedNoticeId === notice.id;
                return (
                    <div key={notice.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
                        <button
                            onClick={() => handleToggleNotice(notice.id)}
                            className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            aria-expanded={isExpanded}
                            aria-controls={`notice-content-${notice.id}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {notice.isPinned && <span className="bg-amber-600/85 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">중요</span>}
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{notice.title}</p>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{notice.createdAt} · {notice.authorName}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div
                            id={`notice-content-${notice.id}`}
                            className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            style={{ transitionProperty: 'max-height, opacity, padding' }}
                        >
                            <div className={`p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 ${!isExpanded && 'hidden'}`}>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{notice.content}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
