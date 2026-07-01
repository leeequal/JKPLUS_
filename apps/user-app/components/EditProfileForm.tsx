import React, { useState, useCallback, ChangeEvent, FormEvent, useMemo, useRef } from 'react';
import { ImageCropModal } from './ImageCropModal';
import { KOREAN_AREAS } from '../data/areas';
import { NATIONALITIES } from '../data/nationalities';
import { VISA_TYPES } from '../data/visas';
import { FINANCIAL_INSTITUTIONS } from '../data/financialInstitutions';
import { UserProfile } from './UserInfoView';

export interface ProfileUpdateData {
  name: string;
  gender: 'male' | 'female' | '';
  nationality: 'korean' | 'foreign';
  country?: string;
  countryOther?: string;
  visaType?: string;
  visaTypeOther?: string;
  preferredAreas: string[];
  bank: string;
  accountNumber: string;
  accountHolder: string;
  profilePictureFile?: File;
  bankAccountFile?: File;
  idCardFile?: File;
  safetyCertFile?: File;
}

interface EditProfileFormProps {
  initialProfile: UserProfile;
  onSubmit: (data: ProfileUpdateData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type FormErrors = Partial<Record<keyof ProfileUpdateData, string>>;
type CroppingField = 'profilePictureFile' | 'idCardFile' | 'safetyCertFile' | 'bankAccountFile';

const FileInput: React.FC<{
  id: CroppingField;
  label: string;
  existingFileName?: string;
  newFile: File | null;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>, field: CroppingField) => void;
  error?: string;
}> = ({ id, label, existingFileName, newFile, onFileSelect, error }) => {
  const fileInputBaseClass = "relative flex items-center justify-between w-full h-14 px-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition duration-200";
  const displayedName = newFile?.name || existingFileName;
  const hasFile = !!displayedName;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <label htmlFor={id} className={`${fileInputBaseClass} ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
        <span className={hasFile ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-400'}>
          {hasFile ? `✅ ${displayedName}` : '파일 선택'}
        </span>
        <div className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md border border-slate-200 dark:border-transparent">
          {hasFile ? '변경' : '업로드'}
        </div>
      </label>
      <input type="file" id={id} onChange={(e) => onFileSelect(e, id)} accept="image/*" className="hidden" />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};


export const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialProfile, onSubmit, onCancel, isLoading }) => {
    const formatPhone = (val: string): string => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const [formData, setFormData] = useState({
        name: initialProfile.name,
        gender: initialProfile.gender,
        preferredAreas: initialProfile.preferredAreas,
        bank: initialProfile.bank,
        accountNumber: initialProfile.accountNumber,
        accountHolder: initialProfile.accountHolder,
        visaType: initialProfile.visaType || '',
        visaTypeOther: initialProfile.visaTypeOther || '',
    });
    const [nationalityInfo, setNationalityInfo] = useState({
        type: initialProfile.nationality,
        country: initialProfile.country || '',
        countryOther: initialProfile.countryOther || '',
    });
    const [files, setFiles] = useState<{ profilePictureFile: File | null; idCardFile: File | null; safetyCertFile: File | null; bankAccountFile: File | null }>({
        profilePictureFile: null, idCardFile: null, safetyCertFile: null, bankAccountFile: null
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [croppingImage, setCroppingImage] = useState<{ src: string, field: CroppingField } | null>(null);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    
    const topLevelRegions = useMemo(() => Object.keys(KOREAN_AREAS).filter(k => !k.includes('_')), []);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'country') {
            setNationalityInfo(prev => ({ ...prev, country: value, countryOther: value !== '기타' ? '' : prev.countryOther }));
        } else if (name === 'countryOther') {
            setNationalityInfo(prev => ({ ...prev, countryOther: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name as keyof FormErrors]: undefined }));
        }
    };

    const handleAreaToggle = (area: string) => {
        setFormData(prev => {
            const newAreas = prev.preferredAreas.includes(area) ? prev.preferredAreas.filter(a => a !== area) : [...prev.preferredAreas, area];
            if (errors.preferredAreas && newAreas.length > 0) {
                setErrors(prevErrors => ({ ...prevErrors, preferredAreas: undefined }));
            }
            return { ...prev, preferredAreas: newAreas };
        });
    };
    
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, field: CroppingField) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setCroppingImage({ src: reader.result as string, field });
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = useCallback((croppedFile: File) => {
        if (croppingImage) {
            setFiles(prev => ({ ...prev, [croppingImage.field]: croppedFile }));
            setErrors(prev => ({ ...prev, [croppingImage.field]: undefined }));
            setCroppingImage(null);
        }
    }, [croppingImage]);

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
        if (formData.preferredAreas.length === 0) newErrors.preferredAreas = '선호 지역을 1개 이상 선택해주세요.';
        if (!formData.bank) newErrors.bank = '금융 기관을 선택해주세요.';
        if (!/^\d+$/.test(formData.accountNumber.replace(/-/g, ''))) newErrors.accountNumber = '올바른 계좌번호를 입력해주세요.';
        if (!formData.accountHolder.trim()) newErrors.accountHolder = '예금주명을 입력해주세요.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            const submissionData: ProfileUpdateData = {
                ...formData,
                nationality: nationalityInfo.type,
                country: nationalityInfo.country,
                countryOther: nationalityInfo.countryOther,
                ...files,
            };
            onSubmit(submissionData);
        }
    };

    const commonInputClass = "w-full bg-white dark:bg-slate-700/50 border border-slate-250 dark:border-slate-600 rounded-md px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed shadow-inner";

    return (
        <form onSubmit={handleSubmit} noValidate className="animate-fadeIn space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">회원 정보 수정</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">수정할 정보를 입력하고 저장해주세요.</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5 shadow-sm dark:shadow-none transition-colors duration-300">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">기본 정보</h3>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={commonInputClass} required />
                    {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">주민등록번호 (외국인등록번호)</label>
                    <input type="text" value={initialProfile.rrn} className={commonInputClass} readOnly disabled />
                </div>
            </div>

            {/* Contact & Area */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5 shadow-sm dark:shadow-none transition-colors duration-300">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">연락처 및 선호 지역</h3>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처</label>
                    <input type="tel" value={formatPhone(initialProfile.phone)} className={commonInputClass} readOnly disabled />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">선호 근무 지역 (1개 이상 선택)</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        {/* Area selection UI from RegistrationForm */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className={commonInputClass}>
                                <option value="">시/도 선택</option>
                                {topLevelRegions.map(region => <option key={region} value={region}>{region}</option>)}
                            </select>
                            {selectedRegion && KOREAN_AREAS[selectedRegion]?.length > 0 && (
                                <select value={selectedCity} onChange={(e) => {
                                    const city = e.target.value;
                                    setSelectedCity(city);
                                    if(city && (!KOREAN_AREAS[`${selectedRegion}_${city}`] || KOREAN_AREAS[`${selectedRegion}_${city}`].length === 0)) {
                                      handleAreaToggle(`${selectedRegion} ${city}`);
                                    }
                                }} className={commonInputClass}>
                                    <option value="">시/군/구 선택</option>
                                    {KOREAN_AREAS[selectedRegion].map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            )}
                        </div>
                        {formData.preferredAreas.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">선택된 지역:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.preferredAreas.map(area => (
                                        <span key={area} className="inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                            {area}
                                            <button type="button" onClick={() => handleAreaToggle(area)} className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.preferredAreas && <p className="mt-1 text-xs text-red-400">{errors.preferredAreas}</p>}
                </div>
            </div>

            {/* Bank & Documents */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5 shadow-sm dark:shadow-none transition-colors duration-300">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">계좌 및 서류</h3>
                 <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">금융 기관</label>
                    <select id="bank" name="bank" value={formData.bank} onChange={handleInputChange} className={commonInputClass} required>
                        {FINANCIAL_INSTITUTIONS.map(bank => <option key={bank} value={bank === '은행/증권사 선택' ? '' : bank} disabled={bank === '은행/증권사 선택'}>{bank}</option>)}
                    </select>
                    {errors.bank && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.bank}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">계좌번호</label>
                        <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className={commonInputClass} required />
                        {errors.accountNumber && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.accountNumber}</p>}
                    </div>
                    <div>
                        <label htmlFor="accountHolder" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">예금주명</label>
                        <input type="text" id="accountHolder" name="accountHolder" value={formData.accountHolder} onChange={handleInputChange} className={commonInputClass} required />
                        {errors.accountHolder && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.accountHolder}</p>}
                    </div>
                </div>
                 <FileInput id="idCardFile" label={nationalityInfo.type === 'foreign' ? '외국인등록증 사본' : '신분증 사본'} existingFileName={initialProfile.idCardFileName} newFile={files.idCardFile} onFileSelect={handleFileSelect} error={errors.idCardFile} />
                 <FileInput id="safetyCertFile" label="건설기초안전교육 이수증" existingFileName={initialProfile.safetyCertFileName} newFile={files.safetyCertFile} onFileSelect={handleFileSelect} error={errors.safetyCertFile} />
                 {/* FIX: Changed initialProfile.bankAccountFile to initialProfile.bankAccountFileName to match UserProfile interface */}
                 <FileInput id="bankAccountFile" label="통장 사본" existingFileName={initialProfile.bankAccountFileName} newFile={files.bankAccountFile} onFileSelect={handleFileSelect} error={errors.bankAccountFile} />
                 <FileInput id="profilePictureFile" label="프로필 사진" existingFileName={initialProfile.profilePictureFileName} newFile={files.profilePictureFile} onFileSelect={handleFileSelect} error={errors.profilePictureFile} />
            </div>

            <div className="mt-8 flex justify-end items-center gap-4">
                <button type="button" onClick={onCancel} className="px-6 py-3 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md transition border border-slate-200 dark:border-transparent shadow-sm">
                    취소
                </button>
                <button type="submit" disabled={isLoading} className="px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? '저장 중...' : '정보 저장'}
                </button>
            </div>

            {croppingImage && <ImageCropModal isOpen={!!croppingImage} imageSrc={croppingImage.src} onClose={() => setCroppingImage(null)} onCropComplete={handleCropComplete} aspectRatio={croppingImage.field === 'profilePictureFile' ? 1 : 16 / 10} />}
        </form>
    );
};