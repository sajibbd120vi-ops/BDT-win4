import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthScreenProps {
  onOpenAdmin?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { login, register, adminLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  // Secret admin modal states
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [secretError, setSecretError] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretError('');
    if (!secretPassword.trim()) {
      setSecretError('পাসওয়ার্ড দিন');
      return;
    }

    setSecretLoading(true);
    const res = await adminLogin(secretPassword.trim());
    setSecretLoading(false);

    if (res.success) {
      setShowSecretModal(false);
      setSecretPassword('');
    } else {
      setSecretError(res.message || 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!mobileOrEmail.trim()) {
      setErrorMsg('অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল লিখুন');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);
    const res = await login(mobileOrEmail, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('আপনার সম্পূর্ণ নাম লিখুন');
      return;
    }
    if (!mobileOrEmail.trim() || mobileOrEmail.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 018XXXXXXXX)');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }

    setLoading(true);
    const res = await register(fullName, mobileOrEmail, password, referralCode);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('🎉 অভিনন্দন! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। ভিতরে প্রবেশ করা হচ্ছে...');
    } else {
      setErrorMsg(res.message || 'নিবন্ধন সম্পন্ন হয়নি, পুনরায় চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-white flex flex-col justify-between p-4 selection:bg-emerald-500 selection:text-black">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-sm mx-auto w-full pt-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => {
              setSecretError('');
              setSecretPassword('');
              setShowSecretModal(true);
            }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 cursor-pointer select-none active:scale-95 transition-transform"
          >
            <span className="text-2xl font-mono tracking-tighter">৳ BD TAKA</span>
          </motion.div>
          <h1 className="text-lg font-black tracking-tight text-white">
            বিডি টাকা ডিজিটাল গেমিং ও আর্নিং
          </h1>
          <p className="text-xs text-slate-400">
            নিরাপদ লেনদেন, দ্রুত ক্যাশআউট ও ইনস্ট্যান্ট বোনাস
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center mb-5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 লগইন করুন
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 নতুন সাইনআপ
          </button>
        </div>

        {/* Feedback message alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
          {tab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  মোবাইল নম্বর অথবা ইমেইল
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={mobileOrEmail}
                    onChange={(e) => setMobileOrEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(!showForgot)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {showForgot && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> পাসওয়ার্ড রিসেট:
                  </p>
                  <p>
                    পাসওয়ার্ড ভুলে গেলে এডমিন সাপোর্ট হেল্পলাইনে মেসেজ দিয়ে সরাসরি পাসওয়ার্ড রিসেট করে নিতে পারেন।
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  এখনই সাইনআপ করুন
                </button>
              </div>

              {/* Demo Account Quick Fill */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 block text-center mb-1.5 font-medium">
                  ⚡ দ্রুত টেস্ট একাউন্ট:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOrEmail('01712345678');
                    setPassword('password123');
                  }}
                  className="w-full py-1.5 px-2 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-emerald-500/50 text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <span>সাকিব আল হাসান (01712345678)</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                  সম্পূর্ণ নাম
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="018XXXXXXXX"
                    value={mobileOrEmail}
                    onChange={(e) => setMobileOrEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                    পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    placeholder="কমপক্ষে ৬ ডিজিট"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                    কনফার্ম পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    placeholder="পুনরায় পাসওয়ার্ড"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-0.5">
                  রেফারেল কোড (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="যেমন: BD123456"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Promo Highlight */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  🎁 ১ম ডিপোজিট ১০০ ৳ বা বেশি করলেই পাবেন <strong>৫০% অতিরিক্ত বোনাস</strong>!
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'সাইনআপ করুন ও ভিতরে প্রবেশ করুন'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-1">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 text-center py-4 text-[10px] text-slate-500">
        BD TAKA © 2026 • ১০০% সুরক্ষিত ও বিশ্বস্ত প্ল্যাটফর্ম
      </footer>

      {/* Secret Password Modal for Admin */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#091326] border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setShowSecretModal(false);
                setSecretPassword('');
                setSecretError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="text-center space-y-1 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">অ্যাডমিন প্রবেশ</h3>
              <p className="text-[11px] text-slate-400">
                গোপন অ্যাডমিন পাসওয়ার্ড প্রদান করুন
              </p>
            </div>

            {secretError && (
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] text-center">
                {secretError}
              </div>
            )}

            <form onSubmit={handleSecretSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড লিখুন (যেমন: Sajib)"
                  value={secretPassword}
                  onChange={(e) => setSecretPassword(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs placeholder:text-slate-500 focus:outline-none text-center font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={secretLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {secretLoading ? 'যাচাই করা হচ্ছে...' : 'প্রবেশ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
