import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Bell, Eye, EyeOff, RotateCw, LogIn, Lock, X } from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenDeposit,
  unreadCount = 1,
}) => {
  const { currentUser, adminLogin } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Secret admin modal states
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [secretError, setSecretError] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

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

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#091226]/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Brand / Logo - Secret Click Area for Admin */}
          <div
            onClick={() => {
              setSecretError('');
              setSecretPassword('');
              setShowSecretModal(true);
            }}
            className="flex items-center gap-2 cursor-pointer select-none active:opacity-80 transition-opacity"
            title="BD TAKA"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a142c] rounded-[10px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  BD TAKA
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">
                মোবাইল ফাইন্যান্স পোর্টাল
              </p>
            </div>
          </div>

          {/* User Balance & Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {/* Balance Box */}
                <div
                  onClick={onOpenDeposit}
                  className="cursor-pointer group flex items-center gap-1.5 bg-[#0f1d38] hover:bg-[#14264a] border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl px-2.5 py-1 transition-all shadow-sm"
                  title="টাকা রিচার্জ করতে ক্লিক করুন"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-bold flex items-center gap-1">
                      ব্যালেন্স
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBalance(!showBalance);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {showBalance ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      </button>
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono font-bold text-white">
                        {showBalance ? `৳ ${currentUser.balance.toFixed(2)}` : '৳ ****'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefresh();
                        }}
                        className={`text-slate-400 hover:text-emerald-400 transition-transform ${
                          isRefreshing ? 'rotate-180 duration-500' : ''
                        }`}
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                    +
                  </div>
                </div>

                {/* Notification Button */}
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="নোটিফিকেশন"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#091226]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>লগইন / সাইনআপ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secret Password Modal for Admin (Triggered by clicking BD TAKA logo) */}
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
              <X className="w-4 h-4" />
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
    </>
  );
};
