import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useStore } from '../../context/StoreContext';

interface CloudinaryImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  subtitle?: string;
  gridCols?: number;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  label = 'Upload images',
  subtitle = 'Upload 0 to 10 images.',
  gridCols = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useStore();

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check how many more can be added
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      showToast(`You can upload a maximum of ${maxImages} images.`, 'error');
      return;
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);

    // Validate size (max 5MB)
    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds 5MB size limit.`, 'error');
        return;
      }
    }

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        const result = await uploadToCloudinary(file);
        newUrls.push(result.secureUrl);
      }
      onChange([...images, ...newUrls]);
      showToast('Images uploaded to Cloudinary successfully!', 'success');
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      showToast(error.message || 'Failed to upload image to Cloudinary.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (indexToRemove: number) => {
    const nextImages = images.filter((_, idx) => idx !== indexToRemove);
    onChange(nextImages);
  };

  // Build grid slots
  // 1 drop zone slot + N uploaded images + empty gray placeholders to equal maxImages
  const totalSlots = maxImages;
  const canUploadMore = images.length < maxImages;
  const emptyPlaceholdersCount = Math.max(0, totalSlots - images.length - (canUploadMore ? 1 : 0));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h4>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxImages > 1}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Grid of slots matching screenshot */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${gridCols} gap-3`}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(110px, 1fr))`,
        }}
      >
        {/* Dashed Upload Drop Zone */}
        {canUploadMore && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all select-none ${
              isDragging
                ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-600 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 text-brand-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[11px] font-bold">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-0.5" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Upload or drag
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Max file size 5MB</span>
              </div>
            )}
          </div>
        )}

        {/* Uploaded Images */}
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
          >
            <img
              src={url}
              alt={`Uploaded ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(idx);
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-bold font-mono">
              #{idx + 1}
            </div>
          </div>
        ))}

        {/* Empty gray placeholders matching screenshot */}
        {Array.from({ length: emptyPlaceholdersCount }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="aspect-square rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
          />
        ))}
      </div>
    </div>
  );
};
