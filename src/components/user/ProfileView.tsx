import React, { useState } from 'react';
import {
  ArrowUpRight,
  CreditCard,
  ArrowDownLeft,
  Receipt,
  Share2,
  Headphones,
  Send,
  Info,
  LogOut,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Wallet,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface ProfileViewProps {
  onNavigate: (
    target: 'deposit' | 'withdraw' | 'bank' | 'records' | 'refer' | 'help' | 'about',
  ) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const { currentUser, logout } = useAuth();
  const settings = db.getSettings();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleCopyCode = () => {
    if (currentUser?.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleOpenTelegram = () => {
    if (settings.telegramGroupUrl) {
      window.open(settings.telegramGroupUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-white pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-center">
        <h1 className="text-sm font-bold tracking-wide text-white flex items-center justify-center gap-1.5">
          <User className="w-4 h-4 text-emerald-400" />
          <span>ব্যবহারকারী প্রোফাইল</span>
        </h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* User Card */}
        {currentUser ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c2242] via-[#0d1c38] to-[#071024] border border-emerald-500/25 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-[14px] bg-[#091326] flex items-center justify-center font-black text-lg text-emerald-400">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white truncate">
                    {currentUser.name}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{currentUser.mobile}</p>

                {/* UID with copy */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span>UID: {currentUser.uid}</span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Balances & Code Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">বর্তমান ব্যালেন্স</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ৳ {currentUser.balance.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">রেফারেল কোড</span>
                  <span className="text-sm font-black text-white font-mono">
                    {currentUser.referralCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">আপনি বর্তমানে লগইন অবস্থায় নেই।</p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="py-2.5 px-6 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              লগইন অথবা সাইন আপ করুন
            </button>
          </div>
        )}

        {/* 9-Point Profile Menu Options */}
        <div className="p-2 rounded-3xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 shadow-md">
          {/* 1. Withdraw */}
          <button
            type="button"
            onClick={() => onNavigate('withdraw')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">১. টাকা উত্তোলন (Withdraw)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 2. Bank / Card */}
          <button
            type="button"
            onClick={() => onNavigate('bank')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">২. ব্যাংক ও কার্ড (Bank / Card)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 3. Deposit */}
          <button
            type="button"
            onClick={() => onNavigate('deposit')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">৩. টাকা রিচার্জ (Deposit)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 4. Records */}
          <button
            type="button"
            onClick={() => onNavigate('records')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">৪. লেনদেনের ইতিহাস (Records)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 5. Referral */}
          <button
            type="button"
            onClick={() => onNavigate('refer')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">৫. রেফারেল প্রোগ্রাম (Referral)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 6. Help Line */}
          <button
            type="button"
            onClick={() => onNavigate('help')}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">৬. সাপোর্ট হেল্প লাইন (Help Line)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 7. Telegram Group */}
          <button
            type="button"
            onClick={handleOpenTelegram}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 block">৭. টেলিগ্রাম চ্যানেল ও গ্রুপ</span>
                <span className="text-[10px] text-slate-400">লাইভ আপডেট ও বোনাস কোড</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </button>

          {/* 8. About Us */}
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-300 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200">৮. আমাদের সম্পর্কে (About Us)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* 9. Logout */}
          {currentUser && (
            <button
              type="button"
              onClick={logout}
              className="w-full p-3 flex items-center justify-between hover:bg-rose-500/10 rounded-2xl text-rose-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">৯. লগআউট (Logout)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#091326] border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>BD TAKA সম্পর্কে</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              BD TAKA বাংলাদেশের একটি সর্বাধুনিক ও নিরাপদ অনলাইন ফাইন্যান্স ও এন্টারটেইনমেন্ট পোর্টাল। এখানে bKash এবং Nagad-এর মাধ্যমে অতি দ্রুত ডিপোজিট ও উইথড্র সম্পন্ন করা হয়।
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>ভার্সন: v2.5.0 Pro</div>
              <div>সিকিউরিটি: এন্ড-টু-এন্ড এনক্রিপ্টেড</div>
              <div>সার্ভিস: ২৪/৭ গ্রাহক সেবা</div>
            </div>
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
