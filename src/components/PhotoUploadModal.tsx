import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Trash2, 
  Check, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  onPhotoSaved: (newPhotoUrl: string) => Promise<void> | void;
  onPhotoRemoved?: () => Promise<void> | void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  onPhotoSaved,
  onPhotoRemoved,
}) => {
  const [mode, setMode] = useState<'select' | 'camera' | 'crop'>('select');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup camera stream when modal closes or mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode('select');
      setImageSrc(null);
      setErrorMessage(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // File Picker Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageSrc(event.target.result);
        setMode('crop');
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  // Camera Launcher
  const startCamera = async () => {
    setErrorMessage(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Camera access is not supported by this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setMode('camera');
    } catch (err: any) {
      console.warn('Camera access notice:', err.name || err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
        setErrorMessage('Camera access was denied by your browser. Please select a photo from your gallery or files instead.');
      } else {
        setErrorMessage('Unable to activate camera hardware. Please use file upload instead.');
      }
    }
  };

  // Camera Snapshot Capture
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop from video feed
    const startX = ((video.videoWidth || 640) - size) / 2;
    const startY = ((video.videoHeight || 640) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setImageSrc(dataUrl);
    setMode('crop');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan / Drag handlers for crop preview
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Confirm Crop and Export Optimized WebP Data URL
  const handleConfirmCrop = async () => {
    if (!imageSrc) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Render into a clean, crisp 320x320 square avatar
      const outputCanvas = document.createElement('canvas');
      const targetSize = 320;
      outputCanvas.width = targetSize;
      outputCanvas.height = targetSize;
      const ctx = outputCanvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, targetSize, targetSize);

      ctx.save();
      ctx.translate(targetSize / 2, targetSize / 2);
      ctx.translate(pan.x * (targetSize / 260), pan.y * (targetSize / 260));
      ctx.scale(zoom, zoom);

      // Fit aspect ratio
      const aspect = img.width / img.height;
      let drawW = targetSize;
      let drawH = targetSize;
      if (aspect > 1) {
        drawW = targetSize * aspect;
      } else {
        drawH = targetSize / aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Convert to optimized WebP (or JPEG fallback)
      let finalDataUrl = outputCanvas.toDataURL('image/webp', 0.88);
      if (!finalDataUrl.startsWith('data:image/webp')) {
        finalDataUrl = outputCanvas.toDataURL('image/jpeg', 0.88);
      }

      await onPhotoSaved(finalDataUrl);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error('Photo save error:', err);
      setErrorMessage(err.message || 'Failed to process and save avatar.');
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (onPhotoRemoved) {
      setIsSaving(true);
      await onPhotoRemoved();
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#111827] border border-[#263548] rounded-3xl p-6 shadow-2xl space-y-5 text-[#F9FAFB] relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#C7F36B]" />
            <h3 className="font-display font-bold text-lg text-[#F9FAFB]">
              {mode === 'crop' ? 'Crop & Adjust Photo' : 'Manage Profile Photo'}
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-[#F4F4EC]/60 hover:text-white"
            aria-label="Close photo modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: SELECT SOURCE */}
        {mode === 'select' && (
          <div className="space-y-4">
            {/* Current photo preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#263548]/30 border border-[#263548]">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#C7F36B] shadow-xl mb-3">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#263548] flex items-center justify-center text-[#F4F4EC]/40 text-xs">
                    No photo
                  </div>
                )}
              </div>
              <p className="text-xs text-[#F4F4EC]/70 text-center">
                JPG, PNG or WebP • Max 5MB • Formatted for Indian Roomie discovery
              </p>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Selection buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl bg-[#263548] hover:bg-[#263548]/80 border border-[#263548] hover:border-[#C7F36B]/40 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center text-[#C7F36B] mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#F9FAFB]">Upload File</p>
                <p className="text-[10px] text-[#F4F4EC]/50 mt-0.5">Gallery or PC storage</p>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="p-4 rounded-2xl bg-[#263548] hover:bg-[#263548]/80 border border-[#263548] hover:border-[#C7F36B]/40 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center text-[#C7F36B] mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#F9FAFB]">Use Camera</p>
                <p className="text-[10px] text-[#F4F4EC]/50 mt-0.5">Take a live portrait</p>
              </button>
            </div>

            {/* Remove photo option if user already has a photo */}
            {currentPhotoUrl && onPhotoRemoved && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Profile Photo</span>
              </button>
            )}

            {/* Storage Architecture Note */}
            <div className="p-3 rounded-xl bg-[#263548]/20 border border-[#263548]/50 text-[11px] text-[#F4F4EC]/60 space-y-1">
              <span className="font-semibold text-[#C7F36B] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Storage & Persistence</span>
              </span>
              <p>
                Your selected photo is automatically downscaled, optimized into high-definition WebP format, and synced to your Firestore profile (`profiles/uid`). Persists across refreshes, logins and device sessions.
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: LIVE CAMERA CAPTURE */}
        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full max-w-xs mx-auto rounded-3xl overflow-hidden bg-black border-2 border-[#C7F36B]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {/* Circular framing guide */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#C7F36B]/60 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setMode('select');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={takeSnapshot}
                className="flex-2 py-2.5 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/20"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: CROP & ZOOM PREVIEW */}
        {mode === 'crop' && imageSrc && (
          <div className="space-y-4">
            {/* Interactive Preview Canvas Area */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-square w-64 mx-auto rounded-full overflow-hidden bg-black border-2 border-[#C7F36B] shadow-2xl cursor-grab active:cursor-grabbing select-none"
            >
              <img
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
              />
              <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
            </div>

            <p className="text-[11px] text-[#F4F4EC]/60 text-center">
              Drag photo to reposition • Adjust zoom below
            </p>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#263548]/40 border border-[#263548]">
              <ZoomOut className="w-4 h-4 text-[#F4F4EC]/60 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#C7F36B] h-1.5 bg-[#263548] rounded-lg cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-[#C7F36B] shrink-0" />
              <span className="text-xs font-mono text-[#F9FAFB] w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('select');
                  setImageSrc(null);
                  setPan({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={isSaving}
                className="flex-2 py-2.5 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Avatar...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Use Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
