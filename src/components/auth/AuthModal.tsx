import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Phone, User, KeyRound, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, adminLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin'>(initialMode);

  // Form states
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [adminPin, setAdminPin] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'লগইন ব্যর্থ হয়েছে।');
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
    if (!mobileOrEmail.trim()) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন');
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
      setSuccessMsg('🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ভেতরে প্রবেশ করা হচ্ছে...');
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      setErrorMsg(res.message || 'নিবন্ধন ব্যর্থ হয়েছে');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminPin) {
      setErrorMsg('অ্যাডমিন পাসওয়ার্ড লিখুন');
      return;
    }

    setLoading(true);
    const res = await adminLogin(adminPin);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'ভুল অ্যাডমিন পাসওয়ার্ড!');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('পাসওয়ার্ড পুনরুদ্ধারের ওটিপি আপনার মোবাইল নম্বরে পাঠানো হয়েছে (ডেমো)।');
    setTimeout(() => {
      setMode('login');
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-sm bg-[#0a1329] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          {/* Modal Header */}
          <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                {mode === 'login' && 'BD TAKA-তে লগইন করুন'}
                {mode === 'register' && 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                {mode === 'forgot' && 'পাসওয়ার্ড উদ্ধার'}
                {mode === 'admin' && 'অ্যাডমিন সিক্রেট লগইন'}
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {mode === 'login' && 'আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
                {mode === 'register' && 'ঝটপট ১ মিনিটে ফ্রি অ্যাকাউন্ট খুলুন'}
                {mode === 'forgot' && 'রেজিস্টার্ড মোবাইল নম্বর দিয়ে ওটিপি নিন'}
                {mode === 'admin' && 'মাস্টার কন্ট্রোল প্যানেল এক্সেস'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-700/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-5 mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="p-5">
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    মোবাইল নম্বর অথবা ইমেইল
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="01712345678"
                      value={mobileOrEmail}
                      onChange={(e) => setMobileOrEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">ডেমো অ্যাকাউন্ট: 01712345678</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      পাসওয়ার্ড
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">ডেমো পাসওয়ার্ড: password123</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </div>

                {/* Quick 1-click test credentials */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 block text-center font-medium">
                    ⚡ দ্রুত টেস্ট একাউন্ট:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOrEmail('01712345678');
                        setPassword('password123');
                      }}
                      className="py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 text-center"
                    >
                      ইউজার (সাকিব)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('admin');
                        setAdminPin('admin123');
                      }}
                      className="py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] text-amber-300 text-center"
                    >
                      অ্যাডমিন প্যানেল
                    </button>
                  </div>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    সম্পূর্ণ নাম
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="মোঃ সাকিব আহমেদ"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="018XXXXXXXX"
                      value={mobileOrEmail}
                      onChange={(e) => setMobileOrEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                      পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      placeholder="কমপক্ষে ৬ ডিজিট"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                      কনফার্ম পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      placeholder="পুনরায় পাসওয়ার্ড"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    রেফারেল কোড (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="BD778899"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-xs uppercase placeholder:text-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {loading ? 'নিবন্ধন হচ্ছে...' : 'অ্যাকাউন্ট খুলুন'}
                </button>

                <div className="pt-1 text-center text-xs text-slate-400">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    লগইন করুন
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    রেজিস্টার্ড মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={mobileOrEmail}
                    onChange={(e) => setMobileOrEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  ওটিপি পাঠান
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    লগইন পেইজে ফিরুন
                  </button>
                </div>
              </form>
            )}

            {mode === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>শুধুমাত্র অনুমোদিত অ্যাডমিন ও ম্যানেজমেন্টের জন্য</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    অ্যাডমিন সিক্রেট পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    placeholder="admin123"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">অ্যাডমিন পাসওয়ার্ড: admin123</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  {loading ? 'যাচাই হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ'}
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ব্যবহারকারী লগইন-এ ফিরুন
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Admin Switch */}
          {mode !== 'admin' && (
            <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 text-center flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>অ্যাডমিন পোর্টাল? </span>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className="text-amber-400 font-semibold hover:underline"
              >
                এখানে ক্লিক করুন
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
