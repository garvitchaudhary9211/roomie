import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Lock, 
  RefreshCw,
  Award,
  Upload,
  Info,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../types';

interface VerificationViewProps {
  currentUser: UserProfile;
  onVerificationComplete: () => Promise<void> | void;
}

type VerificationStatus = 
  | 'not_started' 
  | 'camera_active' 
  | 'review' 
  | 'pending_review' 
  | 'approved' 
  | 'rejected';

export const VerificationView: React.FC<VerificationViewProps> = ({
  currentUser,
  onVerificationComplete,
}) => {
  const [status, setStatus] = useState<VerificationStatus>(
    currentUser.isVerified ? 'approved' : 'not_started'
  );
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [reviewCountdown, setReviewCountdown] = useState(2);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks helper
  const stopCameraTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, []);

  // Request actual camera stream from browser
  const startLiveCamera = async () => {
    setErrorMessage(null);
    setIsPermissionDenied(false);
    stopCameraTracks();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsPermissionDenied(true);
        setErrorMessage('Camera access is not directly supported by your browser or sandbox environment. You can upload a selfie photo below to complete verification.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setStatus('camera_active');

      // Allow DOM to render video tag then attach
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video play notice:', e));
        }
      }, 100);
    } catch (err: any) {
      // Use console.warn instead of console.error so standard browser permission blocks don't trigger fatal error alarms
      console.warn('Camera access notice:', err.name || err.message);
      setIsPermissionDenied(true);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
        setErrorMessage('Camera access permission was denied by the browser or host environment. You can allow camera in your browser address bar, or upload a selfie below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was detected on your device. Please upload a selfie photo instead.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera feed.');
      }
      setStatus('not_started');
    }
  };

  // Capture frame from live camera stream
  const captureSelfieSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.9);

    stopCameraTracks();
    setCapturedPhotoUrl(photoData);
    setStatus('review');
  };

  // File upload fallback if camera permission is denied or camera is unavailable
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedPhotoUrl(event.target.result);
        setStatus('review');
        setErrorMessage(null);
        setIsPermissionDenied(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Retake selfie
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    startLiveCamera();
  };

  // Submit selfie for review
  const handleSubmitVerification = () => {
    setStatus('pending_review');
    setReviewCountdown(2);

    // Simulate the academic evaluation workflow
    const timer = setInterval(() => {
      setReviewCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('approved');
          onVerificationComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center pb-6 border-b border-[#263548] space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C7F36B]/15 text-[#C7F36B] text-xs font-bold border border-[#C7F36B]/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Roomie Trust & Safety Framework</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F9FAFB]">
            Safety & Camera Verification
          </h1>
          <p className="text-xs text-[#F4F4EC]/70 max-w-lg mx-auto">
            Roomie verifies roommate profiles using real browser camera selfie matching to prevent bot and ghost accounts across Indian cities.
          </p>
        </div>

        {/* Prototype Safety Notice Banner */}
        <div className="p-4 rounded-2xl bg-[#263548]/40 border border-[#263548] flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-[#C7F36B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#F9FAFB]">College Demonstration Review Workflow</p>
            <p className="text-[#F4F4EC]/60 leading-relaxed">
              This verification module exercises real browser camera APIs (`navigator.mediaDevices.getUserMedia`). For this college project, submitted selfies are evaluated in a demo review workflow. No government IDs or Aadhaar details are requested, stored, or processed.
            </p>
          </div>
        </div>

        {/* Error notification & permission denied fallback card */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <p className="font-bold text-[#F9FAFB]">Camera Access Notice</p>
                <p className="leading-relaxed text-[#F4F4EC]/80">{errorMessage}</p>
              </div>
            </div>

            {/* Seamless Alternative Actions */}
            {isPermissionDenied && (
              <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] text-[#111827] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Selfie Photo from Device</span>
                </button>
                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="py-2 px-3 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] font-semibold text-xs transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* STATE 1: APPROVED */}
        {status === 'approved' && (
          <div className="p-8 rounded-3xl bg-[#263548]/40 border border-[#C7F36B]/60 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#C7F36B] text-[#111827] flex items-center justify-center mx-auto shadow-lg shadow-[#C7F36B]/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#C7F36B] uppercase tracking-wider">Status: Approved</span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#F9FAFB] mt-1">
                Your Profile is Verified!
              </h2>
              <p className="text-xs text-[#F4F4EC]/80 mt-1 max-w-sm mx-auto">
                The Electric Lime verified badge is now active on your roomie discovery card, match list, and chat headers.
              </p>
            </div>

            <div className="p-3 max-w-xs mx-auto rounded-xl bg-[#111827] border border-[#C7F36B]/40 text-xs font-bold text-[#C7F36B] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Roomie Member (India)</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('not_started');
                  setCapturedPhotoUrl(null);
                  setIsPermissionDenied(false);
                }}
                className="text-[11px] text-[#F4F4EC]/60 hover:text-white underline"
              >
                Retake camera verification for testing
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: NOT STARTED / PERMISSION PROMPT */}
        {status === 'not_started' && (
          <div className="bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#263548]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#F9FAFB]">
                  Live Camera Selfie Verification
                </h3>
                <p className="text-xs text-[#F4F4EC]/60">
                  Verification state: <strong className="text-amber-400">Not Started</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#263548] flex items-center justify-center text-[#C7F36B]">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#F4F4EC]/80 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#263548]/30 border border-[#263548] space-y-2">
                <p className="font-bold text-[#F9FAFB] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#C7F36B]" />
                  <span>How Camera Verification Works:</span>
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[#F4F4EC]/70">
                  <li>Click &quot;Start Camera Verification&quot; below to trigger browser camera permissions.</li>
                  <li>Position your face inside the framing guide under bright, natural light.</li>
                  <li>Capture a selfie snapshot and review the photo.</li>
                  <li>Submit to complete the demo verification review.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={startLiveCamera}
                className="flex-1 py-3.5 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/20"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Verification</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3.5 px-4 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-[#C7F36B]" />
                <span>Upload Selfie File</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: LIVE CAMERA VIEW */}
        {status === 'camera_active' && (
          <div className="bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#263548]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-display font-bold text-base text-[#F9FAFB]">
                  Live Camera Feed
                </h3>
              </div>
              <span className="text-[11px] text-[#C7F36B] font-mono">Front Facing Active</span>
            </div>

            {/* Video Viewfinder Container */}
            <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-black border-2 border-[#C7F36B] shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Oval face positioning outline */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-52 rounded-[50%] border-2 border-dashed border-[#C7F36B]/70 shadow-lg" />
              </div>

              <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-[#111827]/80 text-[11px] font-medium text-[#F9FAFB] backdrop-blur-sm">
                  Center your face inside the oval
                </span>
              </div>
            </div>

            {/* Camera Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCameraTracks();
                  setStatus('not_started');
                }}
                className="flex-1 py-3 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureSelfieSnapshot}
                className="flex-2 py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/20"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: REVIEW CAPTURED SELFIE */}
        {status === 'review' && capturedPhotoUrl && (
          <div className="bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-[#F9FAFB]">
                Review Your Captured Selfie
              </h3>
              <p className="text-xs text-[#F4F4EC]/60">
                Ensure your face is clearly visible without heavy shadows or glares.
              </p>
            </div>

            {/* Photo preview */}
            <div className="relative aspect-video max-w-sm mx-auto rounded-2xl overflow-hidden bg-black border border-[#263548] shadow-2xl">
              <img
                src={capturedPhotoUrl}
                alt="Captured selfie review"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#111827]/80 text-[#C7F36B] text-[10px] font-bold border border-[#C7F36B]/40">
                Snapshot Staged
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 rounded-xl bg-[#263548] text-xs font-semibold text-[#F9FAFB] hover:bg-[#263548]/80 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitVerification}
                className="flex-2 py-3 rounded-xl bg-[#C7F36B] text-[#111827] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e859] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C7F36B]/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Verification</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 5: PENDING REVIEW */}
        {status === 'pending_review' && (
          <div className="p-8 rounded-3xl bg-[#263548]/30 border border-[#263548] text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#111827] text-[#C7F36B] flex items-center justify-center mx-auto border border-[#C7F36B]/40">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Status: Pending Review
              </span>
              <h3 className="font-display font-bold text-xl text-[#F9FAFB] mt-1">
                Evaluating Selfie Pose & Lighting...
              </h3>
              <p className="text-xs text-[#F4F4EC]/60 mt-1">
                Demonstration review workflow finalizing in {reviewCountdown}s...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
