import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  RotateCw,
  Wallet,
  BookOpen,
  X,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface DepositViewProps {
  onBack: () => void;
  onViewRecords: () => void;
  onOpenHelp: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  onBack,
  onViewRecords,
  onOpenHelp,
}) => {
  const { currentUser, refreshUser } = useAuth();
  const settings = db.getSettings();

  // Screen 1: Selection states
  const [paymentMethod, setPaymentMethod] = useState<'Nagad' | 'bKash' | 'USDT'>('Nagad');
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Screen 2: Gateway checkout states (Screenshot 3)
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [checkoutMethod, setCheckoutMethod] = useState<'bKash' | 'Nagad'>('Nagad');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  const balance = currentUser?.balance || 0;
  const userDeposits = currentUser ? db.getUserDeposits(currentUser.uid) : [];
  const latestDeposit = userDeposits[0];

  // Preset chips exactly as Screenshot 1
  const presetAmounts = [
    { value: 100, label: '৳ 100' },
    { value: 500, label: '৳ 500' },
    { value: 700, label: '৳ 700' },
    { value: 1000, label: '৳ 1K' },
    { value: 2000, label: '৳ 2K' },
    { value: 3000, label: '৳ 3K' },
    { value: 5000, label: '৳ 5K' },
    { value: 10000, label: '৳ 10K' },
    { value: 15000, label: '৳ 15K' },
    { value: 20000, label: '৳ 20K' },
    { value: 25000, label: '৳ 25K' },
    { value: 50000, label: '৳ 50K' },
  ];

  const currentAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  // Target wallet numbers from settings / user prompt
  const bKashNumber = settings.bKashNumber || '01323367204';
  const nagadNumber = settings.nagadNumber || '01772692185';
  const activeWalletNumber = checkoutMethod === 'bKash' ? bKashNumber : nagadNumber;

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    refreshUser();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenCheckout = () => {
    if (!currentUser) {
      alert('ডিপোজিট করতে অনুগ্রহ করে আগে লগইন করুন।');
      return;
    }
    if (!currentAmount || isNaN(currentAmount) || currentAmount < 100 || currentAmount > 50000) {
      alert('ডিপোজিট পরিমাণ ১০০ ৳ থেকে ৫০,০০০ ৳ এর মধ্যে হতে হবে।');
      return;
    }

    // Generate real-style numeric Order ID matching screenshot
    const genId = '9' + Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    setOrderId(genId);
    setCheckoutMethod(paymentMethod === 'bKash' ? 'bKash' : 'Nagad');
    setTrxId('');
    setErrorMsg('');
    setShowCheckout(true);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(activeWalletNumber.replace(/[^0-9]/g, ''));
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) return;

    const cleanTrx = trxId.trim().toUpperCase();
    if (!cleanTrx || cleanTrx.length < 6) {
      setErrorMsg('সঠিক TrxID অবশ্যই প্রদান করতে হবে (কমপক্ষে ৬-১০ ডিজিট/অক্ষর)');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const res = db.submitDeposit({
        uid: currentUser.uid,
        amount: currentAmount,
        paymentMethod: checkoutMethod,
        transactionId: cleanTrx,
      });

      setSubmitting(false);

      if (res.success) {
        setSuccessModal(true);
      } else {
        setErrorMsg(res.message || 'ডিপোজিট রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#1e2329] pb-24 max-w-md mx-auto relative select-none">
      {/* SCREEN 1: Deposit Method & Amount Selection (Screenshot 1) */}
      {!showCheckout && (
        <div className="space-y-3 p-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-1">
            <button
              type="button"
              onClick={onBack}
              className="p-1 text-slate-700 hover:text-black"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-base font-bold text-slate-800">Deposit</h1>
            <button
              type="button"
              onClick={onViewRecords}
              className="text-xs font-semibold text-slate-700 hover:text-black"
            >
              Deposit history
            </button>
          </div>

          {/* Yellow Gradient Balance Card (Screenshot 1) */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-[#ffd200] via-[#ffc600] to-[#f5ab00] shadow-md relative overflow-hidden text-[#362200]">
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
              <Wallet className="w-4 h-4" />
              <span>Balance</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black font-mono tracking-tight">
                ৳{balance.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={handleRefreshBalance}
                className={`p-1 text-[#362200] hover:opacity-75 transition-transform ${
                  isRefreshing ? 'rotate-180 duration-500' : ''
                }`}
              >
                <RotateCw className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Latest Deposit Status Banner (Shows Rejection Reason or Pending status) */}
          {latestDeposit && latestDeposit.status === 'Rejected' && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  সর্বশেষ ডিপোজিট বাতিল হয়েছে (৳ {latestDeposit.amount})
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
                <span>{latestDeposit.adminNote || 'তথ্য সঠিক নয় বা অ্যাকাউন্টে টাকা জমা হয়নি।'}</span>
              </div>
            </div>
          )}

          {latestDeposit && latestDeposit.status === 'Pending' && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <div>
                  <span className="font-bold block">
                    ডিপোজিট আবেদন পর্যালোচনাধীন (৳ {latestDeposit.amount})
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono">
                    TrxID: {latestDeposit.transactionId}
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

          {/* Payment Method Selector (Nagad, bKash, USDT) */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Nagad Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Nagad')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm ${
                paymentMethod === 'Nagad'
                  ? 'bg-[#f4ad02] text-white ring-2 ring-[#e69e00]'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                {/* Nagad Logo / Orange Icon */}
                <div className="w-7 h-7 rounded-full bg-[#f48120] text-white flex items-center justify-center font-black text-xs">
                  ন
                </div>
              </div>
              <span className="text-xs font-bold">Nagad</span>
            </button>

            {/* bKash Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bKash')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm ${
                paymentMethod === 'bKash'
                  ? 'bg-[#e2136e] text-white ring-2 ring-[#c00f5c]'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#e2136e] text-white flex items-center justify-center shadow-sm">
                <span className="font-black text-sm">b</span>
              </div>
              <span className="text-xs font-bold">bKash</span>
            </button>

            {/* USDT Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('USDT')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all relative shadow-sm ${
                paymentMethod === 'USDT'
                  ? 'bg-[#009393] text-white ring-2 ring-[#007a7a]'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {/* +2% Gift Badge */}
              <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-[#ff3b30] text-white text-[9px] font-black flex items-center gap-0.5 shadow">
                <span>🎁</span>
                <span>+2%</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#26a17b] text-white flex items-center justify-center shadow-sm font-bold text-sm">
                ₮
              </div>
              <span className="text-xs font-bold">USDT</span>
            </button>
          </div>

          {/* Deposit Amount Section Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="text-base text-amber-500">💰</span>
              <span>Deposit amount</span>
            </div>

            {/* 12-Chip Grid */}
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((p) => {
                const isSelected = selectedAmount === p.value && !customAmount;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(p.value);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#fff5d6] text-[#b87d00] border-[#f4b300] font-black'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input Field */}
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500 font-bold text-sm">
                ৳
              </div>
              <input
                type="number"
                placeholder="৳100.00 - ৳50,000.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-8 pr-8 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
              {customAmount && (
                <button
                  type="button"
                  onClick={() => setCustomAmount('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Recharge Instructions Box */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Recharge instructions</span>
            </div>
            <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold shrink-0">◆</span>
                <span>If the transfer time is up, please fill out the deposit form again.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold shrink-0">◆</span>
                <span>The amount of a single deposit is 100 - 50,000 ৳.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold shrink-0">◆</span>
                <span>Please do not save the transfer number for future payment. Please request a new payment number each time.</span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Recharge Method:</span>
              <span className="text-xs font-bold text-slate-800">{paymentMethod}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenCheckout}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd200] to-[#f4ad02] hover:from-[#f5c800] hover:to-[#e69e00] text-[#3b2400] font-black text-xs shadow-md transition-all active:scale-95"
            >
              Deposit
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: Dedicated Payment Gateway Checkout (Screenshot 3) */}
      {showCheckout && (
        <div className="min-h-screen bg-[#f7f8fa] flex flex-col text-slate-800">
          {/* Gateway Header */}
          <div className="bg-[#056f4d] text-white px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="p-1 text-white/90 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xs font-bold tracking-wide">Pay</h2>
              <span className="text-[9px] text-white/70">api.watchglb.com</span>
            </div>
            <div className="w-5" />
          </div>

          {/* Green Hero Banner with Order ID & Amount */}
          <div className="bg-[#056f4d] text-white px-4 pt-1 pb-6 text-center space-y-1">
            <div className="text-xs font-medium text-emerald-100">
              অর্ডার আইডি: {orderId}
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              ৳ {currentAmount.toFixed(2)}
            </div>
          </div>

          {/* Main Checkout Container Card */}
          <div className="flex-1 px-3 -mt-3 space-y-3 pb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 border border-slate-100">
              {/* Payment Channel Header & Language Toggle */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-700">পেমেন্ট চ্যানেল</span>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-1.5 py-0.5 rounded ${
                      language === 'bn' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    বাং
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-1.5 py-0.5 rounded ${
                      language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Channel Selector Radio Options */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* bKash Channel */}
                <button
                  type="button"
                  onClick={() => setCheckoutMethod('bKash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    checkoutMethod === 'bKash'
                      ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    checkoutMethod === 'bKash' ? 'border-emerald-600' : 'border-slate-300'
                  }`}>
                    {checkoutMethod === 'bKash' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div className="w-5 h-5 rounded-md bg-[#e2136e] text-white flex items-center justify-center text-[10px] font-black">
                    b
                  </div>
                  <span className="text-xs font-bold">bKash</span>
                </button>

                {/* Nagad Channel */}
                <button
                  type="button"
                  onClick={() => setCheckoutMethod('Nagad')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    checkoutMethod === 'Nagad'
                      ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    checkoutMethod === 'Nagad' ? 'border-emerald-600' : 'border-slate-300'
                  }`}>
                    {checkoutMethod === 'Nagad' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div className="w-5 h-5 rounded-md bg-[#f48120] text-white flex items-center justify-center text-[10px] font-black">
                    ন
                  </div>
                  <span className="text-xs font-bold">Nagad</span>
                </button>
              </div>

              {/* Sub-Header */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-700">
                <span className="font-bold">শুধু ২টি ধাপে, পেমেন্ট সম্পন্ন করুন।</span>
                <span className="text-amber-600 font-medium flex items-center gap-0.5 cursor-pointer">
                  বিস্তারিত ব্যাখ্যা <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* STEP 1: Copy Wallet Number */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span>এই {checkoutMethod} নাম্বার শুধুমাত্র সেন্ড মানি গ্রহণ করা হয়</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-[#fbfcfd] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Wallet No*</span>
                      <span className="text-sm font-black font-mono text-slate-900 tracking-wider">
                        {activeWalletNumber}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="px-4 py-1.5 rounded-lg bg-[#056f4d] hover:bg-[#045c40] text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1"
                  >
                    {copiedWallet ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <span>কপি</span>
                    )}
                  </button>
                </div>

                {/* Send Money Pill Notice */}
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-600 flex items-center gap-2">
                  <span>🤝</span>
                  <span>'সেন্ড মানি' দিয়ে পরিশোধ করুন</span>
                </div>
              </div>

              {/* STEP 2: Input Transaction ID */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>সেন্ড মানির TrxID নাম্বার লিখুন (প্রয়োজন)</span>
                </div>

                <input
                  type="text"
                  placeholder="TrxID অবশ্যই প্রদান করতে হবে!"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white shadow-inner"
                />

                {errorMsg && (
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitDeposit}
                className="w-full py-3.5 rounded-xl bg-[#056f4d] hover:bg-[#045c40] text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'যাচাই করা হচ্ছে...' : 'জমা দিন'}
              </button>
            </div>

            {/* Explanatory Reminder Footnotes (Screenshot 3) */}
            <div className="space-y-2 text-[10px] text-slate-500 leading-relaxed px-1">
              <p>
                পৃষ্ঠায় প্রদর্শিত ওয়ালেট নম্বরটি শুধুমাত্র এই অর্ডারের জন্য বৈধ। বারবার পেমেন্টের জন্য এটি সংরক্ষণ করবেন না।
              </p>
              <p>
                বিকাশ বা নগদ আইকনে ক্লিক করুন অ্যাকাউন্টটি পেতে। অনুগ্রহ করে সঠিক অর্ডার অ্যামাউন্টটি নির্বাচিত অ্যাকাউন্টে পরিশোধ করুন।
              </p>
              <p>
                একই অ্যাকাউন্টের সাথে একাধিক ওয়ালেট রেজিস্টার থাকতে পারে, অনুগ্রহ করে অন্য কোনো ওয়ালেটে টাকা ট্রান্সফার করবেন না।
              </p>
              <p>
                গুরুত্বপূর্ণ স্মরণিকা: আপনি যদি ভিন্ন কোনো ওয়ালেটে টাকা ট্রান্সফার করেন, আমাদের কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-3 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-slate-900">ডিপোজিট রিকোয়েস্ট সফল!</h3>
              <p className="text-xs text-slate-500">
                আপনার <strong>৳ {currentAmount}</strong> ডিপোজিট রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে। TrxID যাচাইয়ের পর ব্যালেন্সে যুক্ত হবে।
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono font-bold text-slate-700">
                TrxID: {trxId}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessModal(false);
                  setShowCheckout(false);
                  onViewRecords();
                }}
                className="w-full py-2.5 rounded-xl bg-[#056f4d] hover:bg-[#045c40] text-white font-bold text-xs transition-colors"
              >
                হিসাব খাতা দেখুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
