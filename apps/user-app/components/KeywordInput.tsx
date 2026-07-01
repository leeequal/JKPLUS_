
import React, { useState, useCallback, ChangeEvent, FormEvent, useMemo, useRef, useEffect } from 'react';
import { ImageCropModal } from './ImageCropModal';
import { KOREAN_AREAS } from '../data/areas';
import { NATIONALITIES } from '../data/nationalities';
import { VISA_TYPES } from '../data/visas';
import { FINANCIAL_INSTITUTIONS } from '../data/financialInstitutions';

export interface SubmissionData {
  name: string;
  rrn: string;
  gender: 'male' | 'female' | '';
  nationality: 'korean' | 'foreign';
  country?: string;
  countryOther?: string;
  visaType?: string;
  visaTypeOther?: string;
  phone: string;
  preferredAreas: string[];
  bank: string;
  accountNumber: string;
  accountHolder: string;
  profilePictureFile?: File;
  bankAccountFile: File;
  idCardFile: File;
  safetyCertFile: File;
  signatureDataUrl: string;
}

interface RegistrationFormProps {
  onSubmit: (data: SubmissionData) => void;
  isLoading: boolean;
  currentUserPhone: string;
}

const initialFormData = {
  name: '',
  rrn: '',
  gender: '' as 'male' | 'female' | '',
  phone: '',
  bank: '',
  accountNumber: '',
  accountHolder: '',
  visaType: '',
  visaTypeOther: '',
};

type FormErrors = Partial<Record<keyof typeof initialFormData | 'profilePictureFile' | 'idCardFile' | 'safetyCertFile' | 'bankAccountFile' | 'preferredAreas' | 'country' | 'countryOther' | 'agreement' | 'signature', string>>;
type CroppingField = 'profilePictureFile' | 'idCardFile' | 'safetyCertFile' | 'bankAccountFile';

const AGREEMENT_TEXT = `
(주)건설 인력 매칭 플랫폼(이하 '회사')는 귀하의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다. 회사는 아래와 같은 목적으로 개인정보를 수집 및 이용하며, 귀하의 동의 없이는 제3자에게 제공하지 않습니다.

**1. 개인정보 수집 및 이용 목적**
- **인력 매칭 및 업무 배정:** 구인 업체에 인력 정보 제공, 건설 현장 업무 배정
- **근로 계약 및 관리:** 전자 근로계약서 작성, 노무 관리, 출퇴근 기록 관리
- **급여 지급 및 정산:** 급여 계산, 원천징수(소득세, 지방소득세), 급여 이체
- **수수료 정산:** 서비스 이용에 따른 수수료 공제 및 정산
- **4대 보험 및 관련 행정 업무:** 고용보험, 산재보험, 건강보험, 국민연금 등 필수 보험 가입/상실 신고 및 관련 행정 업무 대행
- **법적 의무 준수:** 관계 법령에 따른 증빙 서류 보관 및 제출
- **고객 지원:** 서비스 관련 문의 응대, 공지사항 전달

**2. 수집하는 개인정보 항목**
- **필수 항목:** 성명, 주민등록번호(외국인등록번호), 연락처, 국적, 비자 종류, 주소, 계좌정보(은행명, 계좌번호, 예금주), 신분증 사본, 건설기초안전교육 이수증 사본, 통장 사본
- **선택 항목:** 프로필 사진, 선호 근무 지역

**3. 개인정보의 보유 및 이용 기간**
회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
- **근로기준법:** 근로자 명부 및 계약 관련 서류 - 3년
- **전자상거래 등에서의 소비자보호에 관한 법률:** 대금 결제 및 재화 등의 공급에 관한 기록 - 5년
- **국세기본법:** 세법이 규정하는 모든 거래에 관한 장부 및 증빙서류 - 5년

**4. 동의를 거부할 권리 및 거부 시 불이익**
귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부하실 경우 인력 등록, 급여 지급 등 서비스 이용이 제한될 수 있습니다.

본인은 위 내용을 충분히 숙지하였으며, 회사가 위와 같이 본인의 개인정보를 수집하고 이용하는 것에 동의합니다.
`;


const calculateAge = (rrn: string): number | null => {
    const cleanedRrn = rrn.replace(/\D/g, '');
    if (cleanedRrn.length < 7) return null;

    const yearStr = cleanedRrn.substring(0, 2);
    const monthStr = cleanedRrn.substring(2, 4);
    const dayStr = cleanedRrn.substring(4, 6);
    const genderDigit = cleanedRrn.charAt(6);

    let birthYear: number;
    if (['1', '2', '5', '6'].includes(genderDigit)) {
        birthYear = 1900 + parseInt(yearStr, 10);
    } else if (['3', '4', '7', '8'].includes(genderDigit)) {
        birthYear = 2000 + parseInt(yearStr, 10);
    } else {
        return null; // Invalid gender digit
    }

    const birthDate = new Date(birthYear, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
    if (birthDate.getFullYear() !== birthYear || birthDate.getMonth() !== parseInt(monthStr, 10) - 1 || birthDate.getDate() !== parseInt(dayStr, 10)) {
        return null; // Invalid date (e.g., Feb 30)
    }

    const today = new Date();
    if (birthDate > today) {
        return null; // Cannot be a future date
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const formatPhoneNumber = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
};


// Helper component for step indicator
const StepIndicator: React.FC<{ currentStep: number; stepNumber: number; label: string }> = ({ currentStep, stepNumber, label }) => {
  const isActive = currentStep >= stepNumber;
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
        {stepNumber}
      </div>
      <span className={`font-medium transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
    </div>
  );
};


export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading, currentUserPhone }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ ...initialFormData, phone: currentUserPhone, preferredAreas: [] as string[] });
  const [nationalityInfo, setNationalityInfo] = useState<{ type: 'korean' | 'foreign' | null, country: string, countryOther: string }>({
    type: null,
    country: '',
    countryOther: ''
  });
  const [files, setFiles] = useState<{ profilePictureFile: File | null; idCardFile: File | null; safetyCertFile: File | null; bankAccountFile: File | null }>({
    profilePictureFile: null,
    idCardFile: null,
    safetyCertFile: null,
    bankAccountFile: null,
  });
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [croppingImage, setCroppingImage] = useState<{ src: string, field: CroppingField } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Step 3 state
  const [isAgreed, setIsAgreed] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastWidthRef = useRef<number>(0);

  const age = useMemo(() => calculateAge(formData.rrn), [formData.rrn]);
  const topLevelRegions = useMemo(() => Object.keys(KOREAN_AREAS).filter(k => !k.includes('_')), []);
  
  useEffect(() => {
    let objectUrl: string | null = null;
    if (files.profilePictureFile) {
        objectUrl = URL.createObjectURL(files.profilePictureFile);
        setProfilePreviewUrl(objectUrl);
    } else {
        setProfilePreviewUrl(null);
    }
    
    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    }
  }, [files.profilePictureFile]);

  const formatRrn = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 13);
    if (limited.length > 6) {
      return `${limited.slice(0, 6)}-${limited.slice(6)}`;
    }
    return limited;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    if (name === 'countryOther') {
        setNationalityInfo(prev => ({ ...prev, countryOther: value }));
    } else if (name === 'visaTypeOther') {
        setFormData(prev => ({ ...prev, visaTypeOther: value }));
    } else {
        const newFormData = { ...formData };
    
        if (name === 'rrn') {
          value = formatRrn(value);
          const cleaned = value.replace(/\D/g, '');
          let newGender: 'male' | 'female' | '' = '';
          let newNationalityType: 'korean' | 'foreign' | null = null;
    
          if (cleaned.length >= 7) {
            const genderDigit = cleaned.charAt(6);
            if (['1', '3'].includes(genderDigit)) {
                newGender = 'male';
                newNationalityType = 'korean';
            } else if (['2', '4'].includes(genderDigit)) {
                newGender = 'female';
                newNationalityType = 'korean';
            } else if (['5', '7'].includes(genderDigit)) {
                newGender = 'male';
                newNationalityType = 'foreign';
            } else if (['6', '8'].includes(genderDigit)) {
                newGender = 'female';
                newNationalityType = 'foreign';
            }
          }
          newFormData.gender = newGender;
          setNationalityInfo(prev => ({ ...prev, type: newNationalityType, country: '', countryOther: '' }));
          if (newNationalityType === 'korean') {
            newFormData.visaType = '';
            newFormData.visaTypeOther = '';
          }
        }
    
        (newFormData as any)[name] = value;
        
        if (name === 'name' && !formData.accountHolder) {
            newFormData.accountHolder = value;
        }
    
        setFormData(newFormData);
    }

    if (errors[name as keyof FormErrors]) {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[name as keyof FormErrors];
            return newErrors;
        })
    }
  };

  const handleAreaToggle = (area: string) => {
    setFormData(prev => {
        const newAreas = prev.preferredAreas.includes(area)
            ? prev.preferredAreas.filter(a => a !== area)
            : [...prev.preferredAreas, area];
        
        if(errors.preferredAreas && newAreas.length > 0) {
            setErrors(prevErrors => {
                const nextErrors = {...prevErrors};
                delete nextErrors.preferredAreas;
                return nextErrors;
            })
        }

        return { ...prev, preferredAreas: newAreas };
    });
  };

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
      const region = e.target.value;
      setSelectedRegion(region);
      setSelectedCity(''); // 시/군/구 선택 초기화

      // 세종시처럼 하위 지역이 없는 경우 바로 추가
      if (region && KOREAN_AREAS[region].length === 0) {
        if (!formData.preferredAreas.includes(region)) {
            handleAreaToggle(region);
        }
      }
  };
  
  const handleCityChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCity(e.target.value);
  }
  
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'country') {
      setNationalityInfo(prev => ({ 
          ...prev, 
          country: value,
          countryOther: value !== '기타' ? '' : prev.countryOther
      }));
    } else if (name === 'visaType') {
        const visaCode = value.split(' ')[0];
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            visaTypeOther: visaCode !== '기타' ? '' : prev.visaTypeOther
        }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name as keyof FormErrors];
          return newErrors;
      })
    }
  }
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, field: CroppingField) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [field]: '이미지 파일만 업로드 가능합니다.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage({ src: reader.result as string, field });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const handleCropComplete = useCallback((croppedFile: File) => {
    if (croppingImage) {
      setFiles(prev => ({ ...prev, [croppingImage.field]: croppedFile }));
      setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[croppingImage.field];
          return newErrors;
      });
      setCroppingImage(null);
    }
  }, [croppingImage]);
  
  const handleCloseCropper = () => {
    setCroppingImage(null);
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';

    if (!/^\d{6}-[1-8]\d{6}$/.test(formData.rrn) || calculateAge(formData.rrn) === null) {
      newErrors.rrn = '올바른 주민등록번호 13자리를 입력해주세요.';
    } else if (nationalityInfo.type === 'foreign') {
      if (!nationalityInfo.country) newErrors.country = '국적을 선택해주세요.';
      else if (nationalityInfo.country === '기타' && !nationalityInfo.countryOther.trim()) {
        newErrors.countryOther = '기타 국적을 직접 입력해주세요.';
      }

      const visaCode = formData.visaType.split(' ')[0];
      if (!formData.visaType) newErrors.visaType = '비자 종류를 선택해주세요.';
      else if (visaCode === '기타' && !formData.visaTypeOther.trim()) {
        newErrors.visaTypeOther = '기타 비자 종류를 직접 입력해주세요.';
      }
    }

    if (!formData.phone) newErrors.phone = '연락처 정보가 없습니다.';
    if (formData.preferredAreas.length === 0) newErrors.preferredAreas = '선호 지역을 1개 이상 선택해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.bank) newErrors.bank = '금융 기관을 선택해주세요.';
    if (!/^\d+$/.test(formData.accountNumber.replace(/-/g, ''))) newErrors.accountNumber = '올바른 계좌번호를 입력해주세요.';
    if (!formData.accountHolder.trim()) newErrors.accountHolder = '예금주명을 입력해주세요.';
    if (!files.bankAccountFile) newErrors.bankAccountFile = '통장 사본을 등록해주세요.';
    if (!files.idCardFile) newErrors.idCardFile = `${nationalityInfo.type === 'foreign' ? '외국인등록증' : '신분증'} 사본을 등록해주세요.`;
    if (!files.safetyCertFile) newErrors.safetyCertFile = '안전교육 이수증 사본을 등록해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!isAgreed) newErrors.agreement = '개인정보 수집 및 이용에 동의해주세요.';
    if (!hasSigned) newErrors.signature = '서명란에 서명을 해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };
  
  const handlePrevStep = () => {
    setStep(s => s - 1);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateStep3() && files.bankAccountFile && files.idCardFile && files.safetyCertFile && nationalityInfo.type && canvasRef.current) {
      // Check if canvas is empty
      const isCanvasBlank = !canvasRef.current.getContext('2d')?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data.some(channel => channel !== 0);
      if (isCanvasBlank) {
        setErrors(prev => ({ ...prev, signature: '서명란에 서명을 해주세요.' }));
        return;
      }

      const signatureDataUrl = canvasRef.current.toDataURL('image/png');

      const submissionData: SubmissionData = {
        ...formData,
        nationality: nationalityInfo.type,
        country: nationalityInfo.country || undefined,
        countryOther: nationalityInfo.countryOther || undefined,
        visaType: formData.visaType || undefined,
        visaTypeOther: formData.visaTypeOther || undefined,
        bankAccountFile: files.bankAccountFile,
        idCardFile: files.idCardFile,
        safetyCertFile: files.safetyCertFile,
        signatureDataUrl: signatureDataUrl,
      };

      if (files.profilePictureFile) {
        submissionData.profilePictureFile = files.profilePictureFile;
      }
      
      onSubmit(submissionData);
    }
  };

    // --- Signature Pad Logic ---
    const getCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const event = 'touches' in e ? e.touches[0] : e;
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        isDrawingRef.current = true;
        setHasSigned(true);
        if (errors.signature) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.signature;
            return newErrors;
          })
        }
        const { x, y } = getCoords(e.nativeEvent);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(e.nativeEvent);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.closePath();
    };

    const handleClearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setHasSigned(false);
    };
    
    useEffect(() => {
        const resizeCanvas = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            // Only resize if the width has changed (to avoid clearing when the height changes slightly on mobile scroll)
            if (Math.abs(lastWidthRef.current - rect.width) > 5) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                lastWidthRef.current = rect.width;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2.5;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
                setHasSigned(false);
            }
          }
        };

        if (step === 3) {
            lastWidthRef.current = 0; // Reset width tracker to trigger resize on step change
            // Delay resize to ensure DOM is rendered
            setTimeout(resizeCanvas, 0);
            window.addEventListener('resize', resizeCanvas);
        }
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [step]);
    // --- End Signature Pad Logic ---

  const commonInputClass = "w-full bg-white dark:bg-slate-700/50 border border-slate-250 dark:border-slate-600 rounded-md px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed shadow-inner";
  const fileInputBaseClass = "relative flex items-center justify-between w-full h-14 px-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition duration-200";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">신규 인력 등록</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">인력의 정보를 정확하게 입력해주세요.</p>
      
      <div className="flex justify-around items-center mb-8 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg transition-colors duration-300">
          <StepIndicator currentStep={step} stepNumber={1} label="본인 인증" />
          <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${step > 1 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
          <StepIndicator currentStep={step} stepNumber={2} label="서류 및 계좌" />
          <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${step > 2 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
          <StepIndicator currentStep={step} stepNumber={3} label="개인정보 동의" />
      </div>

      <div className="relative">
        <div style={{ display: step === 1 ? 'block' : 'none' }} className="animate-fadeIn">
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                  <label htmlFor="profilePictureFile" className="cursor-pointer group">
                    <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 group-hover:border-amber-500 transition overflow-hidden relative">
                      {profilePreviewUrl ? (
                        <img src={profilePreviewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-xs font-bold">사진 변경</span>
                       </div>
                    </div>
                  </label>
                  <input type="file" id="profilePictureFile" onChange={(e) => handleFileSelect(e, 'profilePictureFile')} accept="image/*" className="hidden" />
                  <label htmlFor="profilePictureFile" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">프로필 사진</label>
                  {errors.profilePictureFile && <p className="text-xs text-red-500 dark:text-red-400">{errors.profilePictureFile}</p>}
                </div>
                <div className="w-full space-y-5">
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={commonInputClass} placeholder="홍길동" required />
                      {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="rrn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">주민등록번호 (외국인등록번호)</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-grow grid grid-cols-2 gap-3">
                          <input
                            type="tel"
                            id="rrn"
                            name="rrn"
                            value={formData.rrn}
                            onChange={handleInputChange}
                            className={commonInputClass}
                            placeholder="900101-1xxxxxx"
                            maxLength={14}
                            required
                          />
                           <div className="h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-sm font-medium">
                            {nationalityInfo.type === 'korean' && `내국인 (${formData.gender === 'male' ? '남' : '여'})`}
                            {nationalityInfo.type === 'foreign' && `외국인 (${formData.gender === 'male' ? '남' : '여'})`}
                            {!nationalityInfo.type && '구분 / 성별'}
                          </div>
                        </div>
                       <div className="w-24 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium">
                          {age !== null ? `만 ${age}세` : '만 나이'}
                       </div>
                    </div>
                    {errors.rrn && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.rrn}</p>}
                  </div>
                </div>
              </div>

              {nationalityInfo.type === 'foreign' && (
                <div className="animate-fadeIn space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">국적</label>
                      <select
                        id="country"
                        name="country"
                        value={nationalityInfo.country}
                        onChange={handleSelectChange}
                        className={`${commonInputClass} ${nationalityInfo.country ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        <option value="">국적 선택</option>
                        {NATIONALITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.country && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.country}</p>}
                    </div>
                     <div>
                      <label htmlFor="visaType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">비자 종류</label>
                      <select
                        id="visaType"
                        name="visaType"
                        value={formData.visaType}
                        onChange={handleSelectChange}
                        className={`${commonInputClass} ${formData.visaType ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        <option value="">비자 종류 선택</option>
                        {VISA_TYPES.map(v => <option key={v.code} value={`${v.code} (${v.name})`}>{`${v.code} (${v.name})`}</option>)}
                      </select>
                      {errors.visaType && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.visaType}</p>}
                    </div>
                  </div>

                  {nationalityInfo.country === '기타' && (
                    <div className="animate-fadeIn">
                       <label htmlFor="countryOther" className="block text-sm font-medium text-slate-300 mb-1">국적 입력</label>
                       <input
                          type="text"
                          id="countryOther"
                          name="countryOther"
                          value={nationalityInfo.countryOther}
                          onChange={handleInputChange}
                          className={commonInputClass}
                          placeholder="국적을 직접 입력해주세요"
                       />
                       {errors.countryOther && <p className="mt-1 text-xs text-red-400">{errors.countryOther}</p>}
                    </div>
                  )}

                  {formData.visaType.startsWith('기타') && (
                     <div className="animate-fadeIn">
                       <label htmlFor="visaTypeOther" className="block text-sm font-medium text-slate-300 mb-1">비자 종류 입력</label>
                       <input
                          type="text"
                          id="visaTypeOther"
                          name="visaTypeOther"
                          value={formData.visaTypeOther}
                          onChange={handleInputChange}
                          className={commonInputClass}
                          placeholder="비자 종류를 직접 입력해주세요"
                       />
                       {errors.visaTypeOther && <p className="mt-1 text-xs text-red-400">{errors.visaTypeOther}</p>}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처</label>
                <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formatPhoneNumber(formData.phone)} 
                    className={commonInputClass}
                    readOnly
                />
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">✅ 로그인 시 인증된 번호입니다.</p>
                {errors.phone && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.phone}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">선호 근무 지역 (1개 이상 선택)</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select value={selectedRegion} onChange={handleRegionChange} className={commonInputClass}>
                        <option value="">시/도 선택</option>
                        {topLevelRegions.map(region => <option key={region} value={region}>{region}</option>)}
                      </select>

                      {selectedRegion && KOREAN_AREAS[selectedRegion]?.length > 0 && (
                        <select value={selectedCity} onChange={handleCityChange} className={commonInputClass}>
                            <option value="">시/군/구 선택</option>
                            {KOREAN_AREAS[selectedRegion].map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="mt-3">
                      {(() => {
                        const subDistricts = KOREAN_AREAS[`${selectedRegion}_${selectedCity}`];
                        if (selectedCity && subDistricts?.length > 0) {
                          return (
                            <div className="max-h-48 overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {subDistricts.map(district => {
                                        const fullAreaName = `${selectedRegion} ${selectedCity} ${district}`;
                                        const isSelected = formData.preferredAreas.includes(fullAreaName);
                                        return (
                                          <button 
                                            type="button"
                                            key={district} 
                                            onClick={() => handleAreaToggle(fullAreaName)}
                                            className={`w-full text-sm text-center px-2 py-2 rounded-md transition ${isSelected ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}
                                          >
                                              {district}
                                          </button>
                                        );
                                    })}
                                </div>
                            </div>
                          );
                        }
                        
                        if (selectedCity && (!subDistricts || subDistricts.length === 0)) {
                            const fullAreaName = `${selectedRegion} ${selectedCity}`;
                            const isSelected = formData.preferredAreas.includes(fullAreaName);
                            return (
                                <div className="p-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleAreaToggle(fullAreaName)}
                                        disabled={isSelected}
                                        className="w-full sm:w-auto text-sm px-4 py-2 rounded-md transition bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed border border-slate-200 dark:border-transparent"
                                    >
                                      {fullAreaName} {isSelected ? '(선택됨)' : '지역 추가'}
                                    </button>
                                </div>
                            );
                        }

                        return null;
                      })()}
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
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }} className="animate-fadeIn">
          <div className="space-y-6">
            
            {/* Section 1: ID Card */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
              <h3 className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="ml-2">1. 신분증 등록</span>
              </h3>
              <div>
                <label htmlFor="idCardFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {nationalityInfo.type === 'foreign' ? '외국인등록증 사본' : '신분증 사본'}
                </label>
                <label htmlFor="idCardFile" className={`${fileInputBaseClass} ${errors.idCardFile ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  <span className={files.idCardFile ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-400'}>{files.idCardFile ? `✅ ${files.idCardFile.name}` : '파일 선택'}</span>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md border border-slate-200 dark:border-transparent">업로드</div>
                </label>
                <input type="file" id="idCardFile" onChange={(e) => handleFileSelect(e, 'idCardFile')} accept="image/*" className="hidden" />
                {errors.idCardFile && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.idCardFile}</p>}
              </div>
            </div>

            {/* Section 2: Safety Certificate */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
              <h3 className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618c0-3.37-1.343-6.425-3.544-8.618z" />
                </svg>
                <span className="ml-2">2. 건설기초안전교육 이수증</span>
              </h3>
              <div>
                <label htmlFor="safetyCertFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이수증 파일</label>
                <label htmlFor="safetyCertFile" className={`${fileInputBaseClass} ${errors.safetyCertFile ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  <span className={files.safetyCertFile ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-400'}>{files.safetyCertFile ? `✅ ${files.safetyCertFile.name}` : '파일 선택'}</span>
                  <div className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md border border-slate-200 dark:border-transparent">업로드</div>
                </label>
                <input type="file" id="safetyCertFile" onChange={(e) => handleFileSelect(e, 'safetyCertFile')} accept="image/*" className="hidden" />
                {errors.safetyCertFile && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.safetyCertFile}</p>}
              </div>
            </div>

            {/* Section 3: Bank Account Info */}
            <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
              <h3 className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="ml-2">3. 급여 계좌 정보</span>
              </h3>
              <div className="space-y-5">
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">금융 기관</label>
                  <select id="bank" name="bank" value={formData.bank} onChange={handleSelectChange} className={`${commonInputClass} ${formData.bank ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`} required>
                      {FINANCIAL_INSTITUTIONS.map(bank => (
                          <option key={bank} value={bank === '은행/증권사 선택' ? '' : bank} disabled={bank === '은행/증권사 선택'}>
                              {bank}
                          </option>
                      ))}
                  </select>
                  {errors.bank && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.bank}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">계좌번호</label>
                    <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className={commonInputClass} placeholder="'-' 없이 숫자만 입력" required />
                    {errors.accountNumber && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.accountNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="accountHolder" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">예금주명</label>
                    <input type="text" id="accountHolder" name="accountHolder" value={formData.accountHolder} onChange={handleInputChange} className={commonInputClass} placeholder="계좌 예금주명" required />
                    {errors.accountHolder && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.accountHolder}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="bankAccountFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">통장 사본</label>
                  <label htmlFor="bankAccountFile" className={`${fileInputBaseClass} ${errors.bankAccountFile ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    <span className={files.bankAccountFile ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-400'}>{files.bankAccountFile ? `✅ ${files.bankAccountFile.name}` : '파일 선택'}</span>
                    <div className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-md border border-slate-200 dark:border-transparent">업로드</div>
                  </label>
                  <input type="file" id="bankAccountFile" onChange={(e) => handleFileSelect(e, 'bankAccountFile')} accept="image/*" className="hidden" />
                  {errors.bankAccountFile && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.bankAccountFile}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: step === 3 ? 'block' : 'none' }} className="animate-fadeIn">
          <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
             <h3 className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m0-6l-4 4-4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618c0-3.37-1.343-6.425-3.544-8.618z" />
                </svg>
                <span className="ml-2">3. 개인정보 수집 및 이용 동의</span>
              </h3>
              {/* Fix: Cast style object to React.CSSProperties to allow custom properties. */}
              <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md p-4 max-h-64 overflow-y-auto text-slate-700 dark:text-slate-300 transition-colors duration-300" style={{'--tw-prose-bold': '#334155', '--tw-prose-body': '#475569'} as React.CSSProperties}>
                  {AGREEMENT_TEXT.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                          return <h4 key={index} className="font-bold text-base mt-3 mb-1 text-slate-900 dark:text-white">{line.replace(/\*\*/g, '')}</h4>;
                      }
                       if (line.startsWith('- ')) {
                          return <p key={index} className="my-1 ml-2">{line}</p>;
                       }
                      return <p key={index} className="my-1">{line}</p>;
                  })}
              </div>
              <div className="mt-4 flex items-center">
                  <input
                      id="agreement"
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => {
                          setIsAgreed(e.target.checked);
                          if(e.target.checked && errors.agreement) {
                            setErrors(prev => {
                                const newErrors = {...prev};
                                delete newErrors.agreement;
                                return newErrors;
                            })
                          }
                      }}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="agreement" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      위 개인정보 수집 및 이용 약관에 모두 동의합니다.
                  </label>
              </div>
              {errors.agreement && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.agreement}</p>}

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">서명란</label>
                <div className={`relative aspect-[5/2] w-full rounded-md border-2 border-dashed bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 transition-colors ${errors.signature ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair rounded-md"
                        style={{ touchAction: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-transparent"
                    >
                      초기화
                    </button>
                </div>
                 {errors.signature && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.signature}</p>}
              </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        {step === 1 ? (
          <div></div> // Placeholder for layout
        ) : (
          <button type="button" onClick={handlePrevStep} className="px-6 py-3 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md transition border border-slate-200 dark:border-transparent shadow-sm">
            이전 단계
          </button>
        )}

        {step < 3 ? (
          <button type="button" onClick={handleNextStep} className="px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition w-full md:w-auto">
            다음 단계
          </button>
        ) : (
          <button type="submit" disabled={isLoading} className="px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                등록 중...
              </>
            ) : (
              '인력 정보 등록하기'
            )}
          </button>
        )}
      </div>

      {croppingImage && (
        <ImageCropModal 
          isOpen={!!croppingImage}
          imageSrc={croppingImage.src}
          onClose={handleCloseCropper}
          onCropComplete={handleCropComplete}
          aspectRatio={croppingImage.field === 'profilePictureFile' ? 1 : 16 / 10}
        />
      )}
    </form>
  );
};
