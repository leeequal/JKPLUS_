
import React, { useState, useEffect } from 'react';
import { SITES_DATA, Site } from '../../user-app/data/sites';

// Define the shape of employer-requested sites
interface EmployerSite extends Site {
    ownerId?: string;
    status?: 'pending' | 'approved' | 'rejected';
    supervisorName?: string; // Legacy flat structure support
    supervisorPhone?: string; // Legacy flat structure support
    companyLogo?: string;
    createdAt?: string; // ISO string
}

// Helper to format date
const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleString('ko-KR', {
            year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch {
        return isoString;
    }
};

// Modal component for Add/Edit form
const SiteFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (siteData: Site) => void;
    site: Site | null;
}> = ({ isOpen, onClose, onSubmit, site }) => {
    const [formData, setFormData] = useState<Omit<Site, 'id' | 'filledSlots' | 'coords'>>(
        site 
        ? { ...site } 
        : {
            name: '', location: '', mapUrl: '', description: '',
            supervisor: { name: '', phone: '' },
            dailyRate: 160000, totalSlots: 10,
            confirmationDetails: { startTime: '', onArrival: [], contactInfo: '', notes: '' }
        }
    );
    
    // Update form data when site prop changes (e.g. opening modal for editing)
    useEffect(() => {
        if (site) {
            setFormData({ ...site });
        } else {
            setFormData({
                name: '', location: '', mapUrl: '', description: '',
                supervisor: { name: '', phone: '' },
                dailyRate: 160000, totalSlots: 10,
                confirmationDetails: { startTime: '', onArrival: [], contactInfo: '', notes: '' }
            });
        }
    }, [site, isOpen]);
    
    if (!isOpen) return null;

    const formatPhoneNumber = (val: string): string => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('supervisor.')) {
            const field = name.split('.')[1];
            const processedValue = field === 'phone' ? formatPhoneNumber(value) : value;
            setFormData(prev => ({ 
                ...prev, 
                supervisor: { ...prev.supervisor, [field]: processedValue } 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'dailyRate' || name === 'totalSlots' ? Number(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const completeSiteData: Site = {
            ...formData,
            id: site?.id || `site_${Date.now()}`,
            filledSlots: site?.filledSlots || 0,
            coords: site?.coords || { lat: 0, lng: 0 },
            createdAt: site?.createdAt || new Date().toISOString()
        };
        onSubmit(completeSiteData);
    };

    const commonInputClass = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 transition";
    const labelClass = "block text-sm font-medium text-slate-400 mb-1";

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[85vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">{site ? '현장 정보 수정' : '새 현장 추가'}</h3>
                    </div>
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        <div>
                            <label className={labelClass}>현장명</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="예: 강남 파이낸스 센터" className={commonInputClass} required/>
                        </div>
                        
                        <div>
                            <label className={labelClass}>현장 위치 (주소)</label>
                            <input name="location" value={formData.location} onChange={handleChange} placeholder="예: 서울 강남구 역삼동" className={commonInputClass} required/>
                        </div>

                        <div>
                            <label className={labelClass}>업무 내용 (상세)</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="업무 내용을 상세히 적어주세요." className={commonInputClass} rows={3} required/>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>일급 (원)</label>
                                <input name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} className={commonInputClass} required/>
                            </div>
                            <div>
                                <label className={labelClass}>총 모집 인원</label>
                                <input name="totalSlots" type="number" value={formData.totalSlots} onChange={handleChange} className={commonInputClass} required/>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                            <h4 className="text-sm font-bold text-slate-300 mb-3">현장 담당자 정보</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>이름</label>
                                    <input name="supervisor.name" value={formData.supervisor?.name || ''} onChange={handleChange} className={commonInputClass} required/>
                                </div>
                                <div>
                                    <label className={labelClass}>연락처</label>
                                    <input name="supervisor.phone" value={formData.supervisor?.phone || ''} onChange={handleChange} className={commonInputClass} required/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-800/50 rounded-b-xl border-t border-slate-700">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md">취소</button>
                        <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const SiteManagement: React.FC = () => {
    const [sites, setSites] = useState<EmployerSite[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);

    useEffect(() => {
        const employerSitesRaw = localStorage.getItem('employerSites');
        const rawEmployerSites = employerSitesRaw ? JSON.parse(employerSitesRaw) : [];
        
        const employerSites: EmployerSite[] = rawEmployerSites.map((s: any) => ({
            ...s,
            location: s.location || s.address || '', 
            supervisor: s.supervisor || {
                name: s.supervisorName || 'Unknown',
                phone: s.supervisorPhone || ''
            },
            description: s.description || '현장 설명 없음',
            mapUrl: s.mapUrl || '',
            dailyRate: s.dailyRate || 0,
            totalSlots: s.totalSlots || 0,
            filledSlots: s.filledSlots || 0,
            coords: s.coords || { lat: 37.5665, lng: 126.9780 },
            confirmationDetails: s.confirmationDetails || { startTime: '', onArrival: [], contactInfo: '', notes: '' }
        }));
        
        const mergedSites = [
            ...SITES_DATA.map(s => ({ ...s, status: 'approved' } as EmployerSite)),
            ...employerSites
        ];
        
        setSites(mergedSites.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    }, []);

    const handleOpenModal = (site: Site | null) => {
        setEditingSite(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSite(null);
        setIsModalOpen(false);
    };

    const handleFormSubmit = (siteData: Site) => {
        const newSite: EmployerSite = {
            ...siteData,
            status: 'approved',
            ownerId: 'admin' // mark as admin created to save in employerSites
        };
        const updatedSites = [newSite, ...sites];
        setSites(updatedSites);
        
        const employerSitesOnly = updatedSites.filter(s => s.ownerId); 
        localStorage.setItem('employerSites', JSON.stringify(employerSitesOnly));
        
        handleCloseModal();
        alert('새 현장이 성공적으로 등록되었습니다.');
    };

    const handleApprove = (siteId: string) => {
        const updatedSites = sites.map(s => s.id === siteId ? { ...s, status: 'approved' as const } : s);
        setSites(updatedSites);
        
        const employerSitesOnly = updatedSites.filter(s => s.ownerId); 
        localStorage.setItem('employerSites', JSON.stringify(employerSitesOnly));
        
        alert('현장 등록이 승인되었습니다.');
    };

    const handleReject = (siteId: string) => {
        if(!confirm('정말 반려하시겠습니까?')) return;
        const updatedSites = sites.map(s => s.id === siteId ? { ...s, status: 'rejected' as const } : s);
        setSites(updatedSites);
        const employerSitesOnly = updatedSites.filter(s => s.ownerId);
        localStorage.setItem('employerSites', JSON.stringify(employerSitesOnly));
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">현장 관리</h2>
                    <p className="text-slate-400 mt-1">등록된 현장 및 구인자의 승인 요청을 관리합니다.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition">
                    새 현장 추가
                </button>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3">상태</th>
                            <th className="px-6 py-3">등록일시</th>
                            <th className="px-6 py-3">현장명</th>
                            <th className="px-6 py-3">위치</th>
                            <th className="px-6 py-3">담당자</th>
                            <th className="px-6 py-3 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map(site => (
                            <tr key={site.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                <td className="px-6 py-4">
                                    {site.status === 'pending' && <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded animate-pulse">승인 대기</span>}
                                    {site.status === 'approved' && <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">승인됨</span>}
                                    {site.status === 'rejected' && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">반려됨</span>}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-400">{formatDateTime(site.createdAt)}</td>
                                <td className="px-6 py-4 font-medium text-slate-100">{site.name}</td>
                                <td className="px-6 py-4">{site.location}</td>
                                <td className="px-6 py-4">
                                    {site.supervisor?.name || site.supervisorName || '정보 없음'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {site.status === 'pending' ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleApprove(site.id)} className="text-green-400 hover:underline font-bold">승인</button>
                                            <button onClick={() => handleReject(site.id)} className="text-red-400 hover:underline">반려</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleOpenModal(site)} className="text-sky-400 hover:underline">수정</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SiteFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                site={editingSite}
            />
        </div>
    );
};
