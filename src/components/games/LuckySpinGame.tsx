import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Gift, RotateCw, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface LuckySpinGameProps {
  onBack: () => void;
}

export const LuckySpinGame: React.FC<LuckySpinGameProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);

  const currentBalance = currentUser ? currentUser.balance : 500;
  const spinCost = 10;

  const prizeList = [
    { label: '১০ ৳ ক্যাশ', amount: 10 },
    { label: '২০ ৳ ক্যাশ', amount: 20 },
    { label: '৫০ ৳ বোনাস', amount: 50 },
    { label: 'শুভকামনা (০ ৳)', amount: 0 },
    { label: '১০০ ৳ মেগা বোনাস', amount: 100 },
    { label: '৫ ৳ ক্যাশব্যাক', amount: 5 },
    { label: '১৫ ৳ পয়েন্ট', amount: 15 },
    { label: '২৫ ৳ মেগা কয়েন', amount: 25 },
  ];

  const handleSpin = () => {
    if (spinning) return;

    if (currentBalance < spinCost) {
      alert(`আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই! স্পিন করতে ১০ ৳ প্রয়োজন। ডিপোজিট করুন।`);
      return;
    }

    if (currentUser) {
      db.adjustUserBalance(currentUser.uid, -spinCost, 'Lucky Spin স্পিন ফি (১০ ৳)', 'Lucky Spin');
    }

    setSpinning(true);
    setPrize(null);

    const randomDeg = Math.floor(1800 + Math.random() * 1440);
    const newRotation = rotation + randomDeg;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const selectedIndex = Math.floor(Math.random() * prizeList.length);
      const wonPrize = prizeList[selectedIndex];
      setPrize(wonPrize.label);

      if (wonPrize.amount > 0 && currentUser) {
        db.adjustUserBalance(currentUser.uid, wonPrize.amount, `Lucky Spin পুরষ্কার (${wonPrize.label})`, 'Lucky Spin');
      }

      if (currentUser) {
        db.addUserGameBet({
          uid: currentUser.uid,
          gameCode: 'lucky_spin',
          gameName: 'Lucky Spin Wheel',
          period: `SPIN-${Date.now().toString().slice(-6)}`,
          selection: 'Lucky Spin',
          betAmount: spinCost,
          winAmount: wonPrize.amount,
          status: wonPrize.amount > 0 ? 'Won' : 'Lost',
          date: new Date().toLocaleTimeString(),
          result: wonPrize.label,
        });
      }
    }, 3500);
  };

  const mySpinHistory = currentUser ? db.getUserGameBets(currentUser.uid, 'lucky_spin') : [];

  return (
    <div className="min-h-screen bg-[#060c1c] text-white pb-24">
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>
        <h1 className="text-sm font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Lucky Spin Wheel</span>
        </h1>
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
          <Wallet className="w-3.5 h-3.5" />
          <span>৳ {currentBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5 text-center">
        {/* Wheel representation */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

          {/* Rotating Wheel */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
            className="w-full h-full rounded-full border-4 border-amber-400/80 bg-gradient-to-tr from-[#1b173d] via-[#102747] to-[#12362b] shadow-2xl flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-40">
              <div className="bg-emerald-500/30 border-r border-b border-white/20" />
              <div className="bg-purple-500/30 border-b border-white/20" />
              <div className="bg-amber-500/30 border-r border-white/20" />
              <div className="bg-cyan-500/30" />
            </div>

            <div className="z-10 w-20 h-20 rounded-full bg-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-amber-400" />
              <span className="text-[9px] font-black text-amber-300">১০ ৳</span>
            </div>
          </div>
        </div>

        {/* Prize Notification */}
        {prize && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-bounce">
            🎉 অভিনন্দন! আপনি পেয়েছেন: {prize}
          </div>
        )}

        <button
          type="button"
          disabled={spinning}
          onClick={handleSpin}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'হুইল ঘুরছে...' : `স্পিন করুন (১০ ৳)`}</span>
        </button>

        <p className="text-[11px] text-slate-400">
          প্রতিটি স্পিনে ১০ ৳ খরচ হবে এবং জিতে নিতে পারবেন সর্বোচ্চ ১০০ ৳ পর্যন্ত আকর্ষণীয় ক্যাশ পুরস্কার!
        </p>

        {/* Permanent Spin History */}
        <div className="pt-3 text-left space-y-2">
          <span className="text-xs font-bold text-slate-300 block">আমার স্পিন হিস্ট্রি (স্থায়ীভাবে সংরক্ষিত):</span>
          {mySpinHistory.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              এখনো কোনো স্পিন করেননি!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {mySpinHistory.map((h, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{h.result || 'Lucky Spin'}</span>
                    <span className="text-[10px] text-slate-500">{h.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-black ${h.winAmount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {h.winAmount > 0 ? `+ ৳ ${h.winAmount}` : '০ ৳'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
