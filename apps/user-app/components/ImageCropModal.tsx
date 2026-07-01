import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (file: File) => void;
  aspectRatio?: number;
}

const MIN_WIDTH = 150;
const TARGET_WIDTH = 1200; // Standardized output width

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      },
      'image/jpeg',
      0.9 // High quality compression
    );
  });
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, imageSrc, onClose, onCropComplete, aspectRatio = 3 / 2 }) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspectRatio,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  }

  const handleConfirmCrop = async () => {
    const image = imgRef.current;
    if (!image || !crop || !crop.width || !crop.height) {
      alert('이미지를 먼저 로드하고 영역을 선택해주세요.');
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Set canvas size based on the target width, maintaining aspect ratio
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_WIDTH / (cropWidth / cropHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    try {
        const blob = await canvasToBlob(canvas);
        const file = new File([blob], `cropped_image_${Date.now()}.jpeg`, { type: 'image/jpeg' });
        onCropComplete(file);
    } catch(e) {
        console.error('이미지 변환에 실패했습니다.', e);
        alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">이미지 편집</h3>
            <p className="text-sm text-slate-400 mt-1">원하는 영역을 선택해주세요. 이미지는 자동으로 규격화됩니다.</p>
        </div>
        <div className="p-6 flex justify-center bg-slate-900">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={aspectRatio}
            minWidth={MIN_WIDTH}
            ruleOfThirds
            circularCrop={aspectRatio === 1}
          >
            <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '60vh' }} />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-3 p-6 bg-slate-800 rounded-b-xl border-t border-slate-700">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md">
            취소
          </button>
          <button onClick={handleConfirmCrop} className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md">
            확인 및 제출
          </button>
        </div>
      </div>
    </div>
  );
};