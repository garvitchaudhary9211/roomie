import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  sendPasswordReset 
} from '../services/firebaseAuth';
import { UserProfile } from '../types';
import { INDIAN_DEMO_PROFILES } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (uid: string, email: string) => void;
  onLoginAsDemoProfile: (profile: UserProfile) => void;
  onLaunchNewOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onLoginAsDemoProfile,
  onLaunchNewOnboarding,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const user = await signUpWithEmail(email.trim(), password);
        setSuccessMessage('Account created! A verification email has been sent. Setting up your profile...');
        setTimeout(() => {
          onAuthSuccess(user.uid, user.email || email.trim());
          onLaunchNewOnboarding();
          onClose();
        }, 1200);
      } else if (mode === 'login') {
        const user = await signInWithEmail(email.trim(), password);
        onAuthSuccess(user.uid, user.email || email.trim());
        onClose();
      } else if (mode === 'forgot_password') {
        await sendPasswordReset(email.trim());
        setSuccessMessage('Password reset link sent to your email. Check your inbox!');
        setTimeout(() => setMode('login'), 2500);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Email/Password, or use Google Sign-In below.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account already exists with this email. Try logging in instead.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user.uid, user.email || '');
      onClose();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#111827] border border-[#263548] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F9FAFB]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#F4F4EC]/60 hover:text-[#F9FAFB] hover:bg-[#263548] transition-colors focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#C7F36B] flex items-center justify-center text-[#111827] shadow-lg shadow-[#C7F36B]/20">
            <Sparkles className="w-5 h-5 fill-[#111827]" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="font-display font-black text-2xl text-[#F9FAFB]">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Roomie India' : 'Reset Password'}
            </h2>
            <p className="text-xs text-[#F4F4EC]/60">Find your people. Own your space.</p>
          </div>
        </div>

        {/* Error or Success Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#C7F36B]/10 border border-[#C7F36B]/40 text-[#C7F36B] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Tab switcher */}
        {mode !== 'forgot_password' && (
          <div className="flex rounded-xl bg-[#263548]/50 p-1 mb-5 border border-[#263548]">
            <button
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#C7F36B] text-[#111827] shadow'
                  : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#C7F36B] text-[#111827] shadow'
                  : 'text-[#F9FAFB]/70 hover:text-[#F9FAFB]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#263548] hover:bg-[#263548]/80 text-[#F9FAFB] font-semibold text-xs border border-[#263548] hover:border-[#C7F36B]/40 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#263548]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#F4F4EC]/40 tracking-wider">or with email</span>
          <div className="flex-grow border-t border-[#263548]"></div>
        </div>

        {/* Standard Email Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#F4F4EC]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com or @college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#263548]/40 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] placeholder-[#F4F4EC]/30 focus:outline-none focus:border-[#C7F36B]"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#F4F4EC]/80">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrorMessage(null); }}
                    className="text-[11px] text-[#C7F36B] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4F4EC]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#263548]/40 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] placeholder-[#F4F4EC]/30 focus:outline-none focus:border-[#C7F36B]"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#F4F4EC]/80 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#F4F4EC]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#263548]/40 border border-[#263548] text-xs sm:text-sm text-[#F9FAFB] placeholder-[#F4F4EC]/30 focus:outline-none focus:border-[#C7F36B]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#C7F36B] hover:bg-[#b8e859] disabled:opacity-50 text-[#111827] font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C7F36B]/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Sign In to Roomie' : mode === 'signup' ? 'Create Account & Send Verification' : 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {mode === 'forgot_password' && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setMode('login')}
              className="text-xs text-[#F4F4EC]/70 hover:text-white underline"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Quick Indian Demo Profiles Test Drive */}
        <div className="mt-5 pt-4 border-t border-[#263548]">
          <p className="text-[11px] font-semibold text-[#C7F36B] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-[#C7F36B]" />
            <span>Try Sample Indian Roommate Accounts</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {INDIAN_DEMO_PROFILES.slice(0, 3).map((prof) => (
              <button
                key={prof.id}
                onClick={() => {
                  onLoginAsDemoProfile(prof);
                  onClose();
                }}
                className="p-2 rounded-xl bg-[#263548]/60 hover:bg-[#263548] text-left border border-transparent hover:border-[#C7F36B]/40 transition-all flex flex-col items-center text-center"
              >
                <img
                  src={prof.photos[0]}
                  alt={prof.name}
                  className="w-7 h-7 rounded-full object-cover mb-1 border border-[#C7F36B]/50"
                />
                <span className="text-[11px] font-semibold text-[#F9FAFB] truncate w-full">
                  {prof.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#C7F36B] truncate w-full">
                  {prof.destinationCity}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
