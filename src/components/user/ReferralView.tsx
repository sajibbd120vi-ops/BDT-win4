import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

export const ReferralView: React.FC = () => {
  const { currentUser } = useAuth();
  const settings = db.getSettings();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeLevelTab, setActiveLevelTab] = useState<1 | 2 | 3>(1);

  const referralCode = currentUser ? currentUser.referralCode : 'BD778899';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const tree = db.getReferralTree(referralCode);
  const totalReferrals = tree.level1.length + tree.level2.length + tree.level3.length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeMemberList =
    activeLevelTab === 1 ? tree.level1 : activeLevelTab === 2 ? tree.level2 : tree.level3;

  return (
    <div className="min-h-screen bg-[#060c1c] text-white pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-center">
        <h1 className="text-sm font-bold tracking-wide text-white flex items-center justify-center gap-1.5">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>রেফারেল ও টিম কমিশন</span>
        </h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Referral Code & Link Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c2242] via-[#0e1730] to-[#0a1226] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-28 h-28 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                আপনার ব্যক্তিগত রেফারেল কোড
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ৩ লেভেল কমিশন
              </span>
            </div>

            {/* Code Box */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">REFERRAL CODE</span>
                <span className="text-xl font-black text-white font-mono tracking-wider">
                  {referralCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'কপি হয়েছে' : 'COPY CODE'}</span>
              </button>
            </div>

            {/* Link Box */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-medium">
                ইনভাইট শেয়ার লিঙ্ক
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                  title="লিঙ্ক কপি করুন"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Level Commission Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">মোট রেফারেল সদস্য</span>
              <span className="text-lg font-black text-white font-mono">{totalReferrals} জন</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">মোট রেফারেল আয়</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ৳ {tree.totalEarnings}
              </span>
            </div>
          </div>
        </div>

        {/* Level Breakdown Cards */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>৩-লেভেল রেফারেল কাঠামো</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">টায়ার কমিশন</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveLevelTab(1)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeLevelTab === 1
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-emerald-400">লেভেল ১</div>
              <div className="text-xs font-black font-mono mt-0.5">{tree.level1.length} জন</div>
              <div className="text-[9px] text-slate-400">{settings.level1Percent}% কমিশন</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveLevelTab(2)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeLevelTab === 2
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-teal-400">লেভেল ২</div>
              <div className="text-xs font-black font-mono mt-0.5">{tree.level2.length} জন</div>
              <div className="text-[9px] text-slate-400">{settings.level2Percent}% কমিশন</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveLevelTab(3)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeLevelTab === 3
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold text-cyan-400">লেভেল ৩</div>
              <div className="text-xs font-black font-mono mt-0.5">{tree.level3.length} জন</div>
              <div className="text-[9px] text-slate-400">{settings.level3Percent}% কমিশন</div>
            </button>
          </div>

          {/* Members list under selected level */}
          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>লেভেল {activeLevelTab} সদস্যবৃন্দ:</span>
              <span>মোট: {activeMemberList.length} জন</span>
            </div>

            {activeMemberList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                এই লেভেলে এখনও কোনো সদস্য যুক্ত হননি। আপনার রেফার লিঙ্ক শেয়ার করুন!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeMemberList.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.mobile} • {m.date.split(' ')[0]}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold font-mono">
                        + ৳ {m.earnings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Referral Rules Info */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>রেফারেল নিয়ামাবলী ও নিরাপত্তা</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            ১. আপনার ইনভাইট লিঙ্ক ব্যবহার করে অ্যাকাউন্ট খুললে স্বয়ংক্রিয়ভাবে আপনার টিমে যুক্ত হবে।
          </p>
          <p className="text-[11px] leading-relaxed">
            ২. রেফারেল কমিশন সরাসরি আপনার মেইন ব্যালেন্সে যুক্ত হবে যা উত্তোলনযোগ্য।
          </p>
          <p className="text-[11px] leading-relaxed">
            ৩. কোনো প্রকার স্প্যামিং বা ফেক অ্যাকাউন্ট খোলা আইনত দণ্ডনীয়।
          </p>
        </div>
      </div>
    </div>
  );
};
