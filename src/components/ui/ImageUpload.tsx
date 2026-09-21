'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link2, X, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Resizes and compresses an image file to a lightweight data URL
 * Max 1200px width/height, 82% quality JPEG
 */
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image onto canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Ad Flyer / Image',
  helperText = 'Upload a flyer or photo from your phone or computer.',
  required = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Could not process this image. Please try another image or paste an image link.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              mode === 'upload'
                ? 'bg-brand-500 text-dark-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              mode === 'url'
                ? 'bg-brand-500 text-dark-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Use Link</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Direct File Upload */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {!value ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  <span className="text-xs text-slate-300 font-semibold">
                    Optimizing flyer image...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center ring-4 ring-brand-500/10">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Click to choose photo or drag & drop here
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      PNG, JPG, or WEBP from your phone camera, gallery, or computer
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs mt-1 pointer-events-none text-slate-300 border-slate-700"
                  >
                    Select Photo
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Ad flyer preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Image ready to broadcast</span>
                </div>
                <p className="text-xs text-slate-400">
                  This image will be delivered to verified WhatsApp admins to post along with your ad copy.
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClear}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {mode === 'url' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              placeholder="https://yourwebsite.com/flyer.jpg"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value.trim())}
              className="flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-base sm:text-sm text-white placeholder:text-slate-500 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {value && !value.startsWith('data:') && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {value && !value.startsWith('data:') && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-slate-400 truncate">
                <span className="text-emerald-400 font-semibold block">Valid image link</span>
                <span className="truncate block">{value}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};

