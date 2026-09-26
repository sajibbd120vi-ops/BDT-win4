import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface BannerSliderProps {
  onAction: (target: 'deposit' | 'refer' | 'game') => void;
}

interface BannerItem {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  highlight: string;
  desc: string;
  actionText: string;
  actionTarget: 'deposit' | 'refer' | 'game';
  bgGradient: string;
  borderColor: string;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onAction }) => {
  const banners: BannerItem[] = [
    {
      id: 0,
      badge: 'বিকাশ ও নগদ ডিপোজিট',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: 'ঝটপট ক্যাশ-ইন করুন',
      highlight: '১০ ৳ থেকে ৫০০০ ৳',
      desc: '১ থেকে ৫ মিনিটের মধ্যে স্বয়ংক্রিয় ভেরিফিকেশন ও ক্রেডিট!',
      actionText: 'ডিপোজিট করুন',
      actionTarget: 'deposit',
      bgGradient: 'from-[#0b2923] via-[#091b29] to-[#0d162d]',
      borderColor: 'border-emerald-500/30',
    },
    {
      id: 1,
      badge: '৩-লেভেল রেফারেল বোনাস',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      title: 'বন্ধু এনে আয় করুন',
      highlight: 'আজীবন ৫% পর্যন্ত কমিশন',
      desc: 'লেভেল ১, ২ ও ৩ পর্যন্ত প্রতিটি লেনদেনে নিশ্চিত লাভ!',
      actionText: 'রেফার লিঙ্ক পান',
      actionTarget: 'refer',
      bgGradient: 'from-[#220d36] via-[#121633] to-[#0a1224]',
      borderColor: 'border-purple-500/30',
    },
    {
      id: 2,
      badge: 'লাইভ এন্টারটেইনমেন্ট গেমস',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'Win Color & Lucky Spin',
      highlight: '৩০ সেকেন্ডের উত্তেজনাপূর্ণ রাউন্ড',
      desc: 'আপনার পছন্দের রঙ ও সংখ্যা নির্বাচন করে উপভোগ করুন!',
      actionText: 'এখনই খেলুন',
      actionTarget: 'game',
      bgGradient: 'from-[#2e1d09] via-[#1b152d] to-[#081226]',
      borderColor: 'border-amber-500/30',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card border border-slate-700/60 p-4 shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className={`relative rounded-xl p-4 bg-gradient-to-r ${currentBanner.bgGradient} border ${currentBanner.borderColor} overflow-hidden`}
        >
          {/* Subtle Ambient Orbs */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute right-2 top-2 opacity-10">
            <Sparkles className="w-24 h-24 text-white" />
          </div>

          <div className="relative z-10 flex flex-col justify-between min-h-[120px]">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentBanner.badgeColor}`}>
                  {currentBanner.badge}
                </span>
                <span className="flex items-center text-[10px] text-slate-400 gap-0.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  সরাসরি
                </span>
              </div>

              <h2 className="text-base font-extrabold text-white leading-tight">
                {currentBanner.title}{' '}
                <span className="block text-emerald-400 font-black text-sm">
                  {currentBanner.highlight}
                </span>
              </h2>

              <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                {currentBanner.desc}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onAction(currentBanner.actionTarget)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 transition-transform active:scale-95"
              >
                <span>{currentBanner.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-slate-400 font-mono">BD TAKA 100% Verified</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-1.5 mt-2.5">
        {banners.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx
                ? 'w-5 h-1.5 bg-emerald-400'
                : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
