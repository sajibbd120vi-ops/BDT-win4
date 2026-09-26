import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Receipt,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface WithdrawViewProps {
  onBack: () => void;
  onViewRecords: () => void;
  onManageBanks: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  onBack,
  onViewRecords,
  onManageBanks,
}) => {
  const { currentUser, refreshUser } = useAuth();
  const settings = db.getSettings();

  const [method, setMethod] = useState<'NAGAD' | 'BKASH'>('NAGAD');
  const [accountNumber, setAccountNumber] = useState<string>(
    currentUser?.mobile || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successInfo, setSuccessInfo] = useState<{
    id: string;
    amount: number;
    method: string;
    account: string;
  } | null>(null);

  const balance = currentUser?.balance || 0;
  const numAmount = parseFloat(amount) || 0;

  const userWithdrawals = currentUser ? db.getUserWithdrawals(currentUser.uid) : [];
  const latestWithdrawal = userWithdrawals[0];

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('উইথড্র করতে অনুগ্রহ করে আগে লগইন করুন।');
      return;
    }

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 25000) {
      setErrorMsg('উইথড্র পরিমাণ ১০০ ৳ থেকে ২৫,০০০ ৳ এর মধ্যে হতে হবে।');
      return;
    }

    if (numAmount > balance) {
      setErrorMsg('আপনার বর্তমান ব্যালেন্স অপর্যাপ্ত!');
      return;
    }

    if (!accountNumber.trim() || accountNumber.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const res = db.submitWithdrawal({
        uid: currentUser.uid,
        amount: numAmount,
        method: method === 'BKASH' ? 'bKash' : 'Nagad',
        accountNumber: accountNumber.trim(),
        accountHolderName: currentUser.name || 'Account Holder',
      });

      setSubmitting(false);

      if (res.success && res.withdrawal) {
        refreshUser();
        setSuccessInfo({
          id: res.withdrawal.id,
          amount: res.withdrawal.amount,
          method: res.withdrawal.method,
          account: res.withdrawal.accountNumber,
        });
      } else {
        setErrorMsg(res.message || 'উইথড্র রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#1e2329] pb-24 max-w-md mx-auto relative select-none p-3 space-y-3">
      {/* Top Bar (Screenshot 2) */}
      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onBack}
          className="p-1 text-slate-700 hover:text-black"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-base font-bold text-slate-800">Withdraw</h1>
        <button
          type="button"
          onClick={onViewRecords}
          className="text-xs font-semibold text-slate-700 hover:text-black"
        >
          Withdrawal history
        </button>
      </div>

      {/* Latest Withdrawal Status Banner (Shows Rejection Reason or Pending status) */}
      {latestWithdrawal && latestWithdrawal.status === 'Rejected' && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              সর্বশেষ উইথড্র বাতিল হয়েছে (৳ {latestWithdrawal.amount})
            </span>
            <button
              type="button"
              onClick={onViewRecords}
              className="text-[11px] font-bold text-rose-600 underline"
            >
              হিস্ট্রি দেখুন
            </button>
          </div>
          <div className="text-[11px] bg-white p-2 rounded-xl border border-rose-200 text-rose-900">
            <strong>বাতিল করার কারণ: </strong>
            <span>{latestWithdrawal.adminNote || 'মোবাইল নম্বর ভুল বা শর্ত অপূর্ণ। ব্যালেন্স ফেরত দেওয়া হয়েছে।'}</span>
          </div>
        </div>
      )}

      {latestWithdrawal && latestWithdrawal.status === 'Pending' && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <span className="font-bold block">
                উইথড্র আবেদন পর্যালোচনাধীন (৳ {latestWithdrawal.amount})
              </span>
              <span className="text-[10px] text-amber-700 font-mono">
                {latestWithdrawal.method} ({latestWithdrawal.accountNumber})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewRecords}
            className="text-[11px] font-bold text-amber-700 underline"
          >
            হিস্ট্রি
          </button>
        </div>
      )}

      {/* Method / Saved Account Card (Screenshot 2) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
              method === 'BKASH' ? 'bg-[#e2136e]' : 'bg-[#f48120]'
            }`}>
              {method === 'BKASH' ? 'b' : 'ন'}
            </div>
            <div>
              <span className="block font-black text-xs">{method}</span>
              <span className="text-[11px] font-mono text-slate-500">
                {accountNumber ? `${accountNumber.slice(0, 3)}****${accountNumber.slice(-3)}` : 'নম্বর লিখুন'}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setMethod('NAGAD')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                method === 'NAGAD' ? 'bg-[#f48120] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              NAGAD
            </button>
            <button
              type="button"
              onClick={() => setMethod('BKASH')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                method === 'BKASH' ? 'bg-[#e2136e] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              BKASH
            </button>
          </div>
        </div>

        {/* Account Number Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            উইথড্র অ্যাকাউন্ট নম্বর ({method})
          </label>
          <input
            type="text"
            placeholder="01XXXXXXXXX"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-3 py-2 bg-[#f8f9fa] border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Amount Input Box (Screenshot 2) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500 font-bold text-base">
            ৳
          </div>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-lg font-black font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Balance & ALL button (Screenshot 2) */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-amber-500 font-bold">
            Withdrawable balance ৳{balance.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => setAmount(balance.toString())}
            className="px-4 py-1 rounded-full border border-amber-400 text-amber-600 font-bold text-xs hover:bg-amber-50 active:scale-95 transition-all"
          >
            All
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <span>Withdrawal amount received</span>
          <span className="font-mono font-bold text-amber-600">
            ৳{numAmount.toFixed(2)}
          </span>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-1.5 border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Withdraw Action Button */}
        <button
          type="button"
          disabled={submitting || numAmount <= 0}
          onClick={handleWithdrawSubmit}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffd200] to-[#f4ad02] hover:from-[#f5c800] hover:to-[#e69e00] text-[#3b2400] font-black text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'প্রসেস হচ্ছে...' : 'Withdraw'}
        </button>
      </div>

      {/* Rules Box Exactly as Screenshot 2 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
        <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>Need to bet ৳0.00 to be able to withdraw</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>Withdraw time 00:00 - 23:55</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>Inday Remaining Withdrawal Times <strong className="text-rose-500">3</strong></span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>Withdrawal amount range <strong className="text-rose-500">৳100.00 - ৳25,000.00</strong></span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>Please check your registered bank information again before making a withdrawal. If your registered bank information is incorrect, our company will not be responsible for any losses you may incur.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-500 font-bold shrink-0">◆</span>
            <span>If your registered bank information is incorrect, please contact customer service.</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-3 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-900">উইথড্র রিকোয়েস্ট সফল!</h3>
              <p className="text-xs text-slate-500">
                আপনার <strong>৳ {successInfo.amount}</strong> উইথড্র রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন রিভিউয়ের পর আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেওয়া হবে।
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono font-bold text-slate-700">
                {successInfo.method}: {successInfo.account}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessInfo(null);
                  onViewRecords();
                }}
                className="w-full py-2.5 rounded-xl bg-[#056f4d] hover:bg-[#045c40] text-white font-bold text-xs transition-colors"
              >
                উইথড্র হিস্ট্রি দেখুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
