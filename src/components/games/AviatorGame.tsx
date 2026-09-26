import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Wallet,
  Clock,
  Sparkles,
  Trophy,
  History,
  Plane,
  Flame,
  Check,
  AlertTriangle,
  Home,
  User,
  CreditCard,
  Palette,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface AviatorGameProps {
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

interface BetHistoryItem {
  id: string;
  roundMultiplier: number;
  betAmount: number;
  cashedOutMultiplier?: number;
  winAmount: number;
  won: boolean;
  time: string;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({ onBack, onNavigate }) => {
  const { currentUser, refreshUser } = useAuth();
  const balance = currentUser?.balance || 0;

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state: 'betting' | 'flying' | 'crashed'
  const [gameState, setGameState] = useState<'betting' | 'flying' | 'crashed'>('betting');
  const [countdown, setCountdown] = useState(5);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.0);

  // User Bet state
  const [betAmount, setBetAmount] = useState(20);
  const [activeBet, setActiveBet] = useState<{ amount: number } | null>(null);
  const [cashedOut, setCashedOut] = useState<{ multiplier: number; win: number } | null>(null);

  // Win alert modal
  const [winModal, setWinModal] = useState<{ multiplier: number; amount: number } | null>(null);

  // Recent crash history pills
  const [historyList, setHistoryList] = useState<number[]>([
    1.42, 2.85, 1.12, 4.20, 1.88, 12.45, 1.05, 3.10, 2.05, 1.67,
  ]);

  // Persistent user history
  const [userBets, setUserBets] = useState<BetHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'game' | 'history'>('game');

  // Animation frame ref
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Sound generator
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  const playWinSound = () => {
    if (!soundEnabled) return;
    playBeep(523.25, 'triangle', 0.1);
    setTimeout(() => playBeep(659.25, 'triangle', 0.12), 100);
    setTimeout(() => playBeep(783.99, 'triangle', 0.25), 220);
  };

  const playCrashSound = () => {
    if (!soundEnabled) return;
    playBeep(180, 'sawtooth', 0.35);
  };

  // Load existing bets from dbStore
  useEffect(() => {
    if (currentUser) {
      const allBets = db.getUserGameBets(currentUser.uid, 'aviator');
      const mapped: BetHistoryItem[] = allBets.map((b) => ({
        id: b.id,
        roundMultiplier: parseFloat(b.period.replace('x', '')) || 1.5,
        betAmount: b.betAmount,
        cashedOutMultiplier: b.status === 'Won' ? parseFloat(b.period.replace('x', '')) : undefined,
        winAmount: b.winAmount,
        won: b.status === 'Won',
        time: b.date.split(' ')[1] || '00:00:00',
      }));
      setUserBets(mapped);
    }
  }, [currentUser]);

  // Round loop controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'betting') {
      setCashedOut(null);
      setMultiplier(1.0);

      // Random crash point algorithm with natural curve
      // 8% chance of immediate crash (< 1.2x)
      // 60% chance of 1.2x - 3.5x
      // 25% chance of 3.5x - 10x
      // 7% chance of 10x - 50x
      const rand = Math.random();
      let target = 1.0;
      if (rand < 0.08) {
        target = 1.0 + Math.random() * 0.2;
      } else if (rand < 0.68) {
        target = 1.2 + Math.random() * 2.3;
      } else if (rand < 0.93) {
        target = 3.5 + Math.random() * 6.5;
      } else {
        target = 10.0 + Math.random() * 40.0;
      }
      setCrashPoint(parseFloat(target.toFixed(2)));

      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setGameState('flying');
            return 0;
          }
          playBeep(440, 'sine', 0.05);
          return c - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState]);

  // Flying loop
  useEffect(() => {
    if (gameState === 'flying') {
      startTimeRef.current = performance.now();

      const updateFlight = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000; // seconds

        // Multiplier exponential acceleration curve
        const currentM = 1.0 + Math.pow(elapsed * 0.72, 1.85);

        if (currentM >= crashPoint) {
          // Crashed!
          setMultiplier(crashPoint);
          setGameState('crashed');
          playCrashSound();
          handleRoundEnd(crashPoint);
          return;
        }

        setMultiplier(parseFloat(currentM.toFixed(2)));
        animRef.current = requestAnimationFrame(updateFlight);
      };

      animRef.current = requestAnimationFrame(updateFlight);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, crashPoint]);

  // Handle crash state transition
  const handleRoundEnd = (finalCrash: number) => {
    // Add to pill history
    setHistoryList((prev) => [finalCrash, ...prev.slice(0, 14)]);

    // Check if user had an active bet and did not cash out
    if (activeBet && !cashedOut && currentUser) {
      db.addUserGameBet({
        uid: currentUser.uid,
        gameCode: 'aviator',
        gameName: 'Aviator (ট্যাব আটার)',
        period: `${finalCrash}x`,
        selection: 'Crash',
        betAmount: activeBet.amount,
        winAmount: 0,
        status: 'Lost',
        date: new Date().toLocaleString(),
        result: `ক্র্যাশ হয়েছে ${finalCrash}x`,
      });

      setUserBets((prev) => [
        {
          id: 'bet-' + Date.now(),
          roundMultiplier: finalCrash,
          betAmount: activeBet.amount,
          winAmount: 0,
          won: false,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      setActiveBet(null);
    }

    // Wait 3.5 seconds in crashed state, then restart round
    setTimeout(() => {
      setActiveBet(null);
      setGameState('betting');
    }, 3500);
  };

  // Place bet
  const handlePlaceBet = () => {
    if (!currentUser) return;
    if (balance < betAmount) {
      alert('আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই!');
      return;
    }
    if (betAmount < 10) {
      alert('মিনিমাম বেট ১০ ৳');
      return;
    }

    const deducted = db.adjustUserBalance(
      currentUser.uid,
      -betAmount,
      `Aviator বেট (${betAmount} ৳)`,
      'Aviator Engine',
    );

    if (deducted) {
      refreshUser();
      setActiveBet({ amount: betAmount });
      playBeep(600, 'sine', 0.1);
    }
  };

  // Cash Out
  const handleCashOut = () => {
    if (!activeBet || !currentUser || cashedOut || gameState !== 'flying') return;

    const winAmount = parseFloat((activeBet.amount * multiplier).toFixed(2));
    setCashedOut({ multiplier, win: winAmount });

    // Credit win amount
    db.adjustUserBalance(
      currentUser.uid,
      winAmount,
      `Aviator ক্যাশআউট জয় (${winAmount} ৳ @ ${multiplier}x)`,
      'Aviator Engine',
    );
    refreshUser();

    // Save bet history record
    db.addUserGameBet({
      uid: currentUser.uid,
      gameCode: 'aviator',
      gameName: 'Aviator (ট্যাব আটার)',
      period: `${multiplier}x`,
      selection: 'CashOut',
      betAmount: activeBet.amount,
      winAmount,
      status: 'Won',
      date: new Date().toLocaleString(),
      result: `ক্যাশআউট @ ${multiplier}x`,
    });

    setUserBets((prev) => [
      {
        id: 'bet-' + Date.now(),
        roundMultiplier: multiplier,
        betAmount: activeBet.amount,
        cashedOutMultiplier: multiplier,
        winAmount,
        won: true,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);

    setWinModal({ multiplier, amount: winAmount });
    playWinSound();
  };

  // Canvas visual progress percentage for plane position
  const progressRatio = Math.min((multiplier - 1) / (crashPoint > 1.2 ? crashPoint : 2), 1);
  const planeX = 15 + progressRatio * 70; // 15% to 85%
  const planeY = 75 - Math.pow(progressRatio, 0.8) * 55; // 75% to 20%

  return (
    <div className="min-h-screen bg-[#060b17] text-white flex flex-col max-w-md mx-auto relative select-none pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Plane className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h1 className="text-xs font-black text-white flex items-center gap-1">
                <span>Aviator (ট্যাব আটার)</span>
                <span className="px-1 py-0.2 rounded text-[8px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                  LIVE
                </span>
              </h1>
              <span className="text-[9px] text-slate-400">রিয়েল-টাইম ক্র্যাশ গেম</span>
            </div>
          </div>
        </div>

        {/* Balance & Audio & Quick Nav */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('deposit') : null}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
          >
            <CreditCard className="w-3 h-3" />
            <span>ডিপোজিট</span>
          </button>

          <div className="px-2 py-1 rounded-xl bg-[#0f1e38] border border-emerald-500/30 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-black text-emerald-400">
              ৳ {balance.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* History Pill Bar */}
      <div className="px-3 py-2 bg-[#081022] border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> হিস্ট্রি:
        </span>
        {historyList.map((h, idx) => {
          const isHigh = h >= 10.0;
          const isMid = h >= 2.0;
          return (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 shadow-sm border ${
                isHigh
                  ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                  : isMid
                  ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Main Aviator Radar Screen */}
      <div className="p-3">
        <div className="relative w-full h-64 rounded-3xl bg-gradient-to-b from-[#09152b] via-[#081124] to-[#040814] border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
          {/* Background grid lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:28px_28px]" />
          </div>

          {/* SVG Flight Trajectory Curve */}
          {gameState === 'flying' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={`M 20 220 Q ${planeX * 2.8} ${planeY * 2.6} ${planeX * 3.8} ${planeY * 2.6}`}
                fill="none"
                stroke="rgba(244, 63, 94, 0.4)"
                strokeWidth="4"
                strokeDasharray="6,4"
              />
              <path
                d={`M 20 220 Q ${planeX * 2.8} ${planeY * 2.6} ${planeX * 3.8} ${planeY * 2.6} L ${planeX * 3.8} 250 L 20 250 Z`}
                fill="rgba(244, 63, 94, 0.08)"
              />
            </svg>
          )}

          {/* Top Status */}
          <div className="relative z-10 flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              লাইভ রাউন্ড #AW-{Date.now().toString().slice(-4)}
            </span>

            {activeBet && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
                বেট ধরেছেন: ৳ {activeBet.amount}
              </span>
            )}
          </div>

          {/* Center Display: Waiting / Flying Multiplier / Crashed */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
            {gameState === 'betting' && (
              <div className="space-y-2">
                <div className="text-xs uppercase font-black tracking-widest text-slate-400">
                  পরবর্তী রাউন্ড শুরু হচ্ছে
                </div>
                <div className="text-4xl font-black font-mono text-amber-400 drop-shadow-md">
                  {countdown}s
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {gameState === 'flying' && (
              <div className="space-y-1">
                <div className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-rose-500 animate-bounce" />
                  <span>প্লেন উঠছে... দ্রুত ক্যাশআউট করুন!</span>
                </div>
              </div>
            )}

            {gameState === 'crashed' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-1"
              >
                <div className="text-xs uppercase font-black tracking-widest text-rose-400">
                  FLEW AWAY (ক্র্যাশ হয়েছে)
                </div>
                <div className="text-4xl font-black font-mono text-rose-500 drop-shadow-lg">
                  {multiplier.toFixed(2)}x
                </div>
                <p className="text-[10px] text-slate-400">পরের রাউন্ডের জন্য প্রস্তুত হন</p>
              </motion.div>
            )}
          </div>

          {/* Animated Airplane */}
          {gameState === 'flying' && (
            <motion.div
              className="absolute z-20 transition-all duration-75"
              style={{
                left: `${planeX}%`,
                top: `${planeY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                {/* Airplane exhaust glow */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-2 bg-gradient-to-l from-rose-500 to-transparent blur-[2px] rounded-full" />
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 rotate-12">
                  <Plane className="w-6 h-6 fill-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom curve hints */}
          <div className="relative z-10 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1.00x</span>
            <span>ক্র্যাশ হওয়ার আগেই ক্যাশআউট করুন</span>
            <span>50.00x</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Bet / Cashout */}
      <div className="px-3 space-y-3">
        {/* Preset Bet Amount Pills */}
        <div className="grid grid-cols-5 gap-2">
          {[10, 20, 50, 100, 200].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={gameState === 'flying' && !!activeBet}
              onClick={() => setBetAmount(amt)}
              className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                betAmount === amt
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              ৳ {amt}
            </button>
          ))}
        </div>

        {/* Action Button: BET or CASHOUT */}
        <div className="p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">বেট পরিমাণ:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
              >
                -
              </button>
              <span className="font-mono font-black text-emerald-400 text-sm w-16 text-center">
                ৳ {betAmount}
              </span>
              <button
                type="button"
                onClick={() => setBetAmount(betAmount + 10)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Big Action Button */}
          {gameState === 'flying' && activeBet && !cashedOut ? (
            <button
              type="button"
              onClick={handleCashOut}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/40 active:scale-95 transition-all flex flex-col items-center justify-center animate-pulse"
            >
              <div className="flex items-center gap-2">
                <span>ক্যাশ আউট (CASH OUT)</span>
              </div>
              <span className="text-sm font-mono tracking-tight font-extrabold text-slate-950">
                ৳ {(activeBet.amount * multiplier).toFixed(2)} ({multiplier.toFixed(2)}x)
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={gameState === 'flying' || !!activeBet}
              onClick={handlePlaceBet}
              className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                activeBet
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/30 active:scale-95'
              }`}
            >
              {activeBet ? (
                <>
                  <Check className="w-5 h-5 text-amber-400" />
                  <span>বেট কনফার্ম হয়েছে (পরবর্তী রাউন্ডে উড়বে)</span>
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4 fill-white" />
                  <span>বেট ধরুন (৳ {betAmount})</span>
                </>
              )}
            </button>
          )}

          {cashedOut && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center text-xs font-bold font-mono">
              🎉 আপনি {cashedOut.multiplier}x-এ ক্যাশআউট করে জিতেছেন ৳ {cashedOut.win}!
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Rules & History */}
      <div className="p-3">
        <div className="flex border-b border-slate-800 text-xs font-bold mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('game')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'game'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            📜 গেমের নিয়মাবলী
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            📋 আমার বেট হিস্ট্রি ({userBets.length})
          </button>
        </div>

        {activeTab === 'game' && (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p>
              ১. রাউন্ড শুরুর আগে আপনার কাঙ্ক্ষিত বেট পরিমাণ নির্বাচন করে <strong>"বেট ধরুন"</strong> চাপুন।
            </p>
            <p>
              ২. প্লেন যত উঁচুতে উঠবে গুণিতক (Multiplier) তত বাড়তে থাকবে (১.০০x থেকে ৫০.০০x পর্যন্ত)।
            </p>
            <p>
              ৩. প্লেন ক্র্যাশ করার আগেই <strong>"ক্যাশ আউট"</strong> বাটনে ক্লিক করে টাকা তুলে নিন।
            </p>
            <p>
              ৪. ক্যাশ আউট করার পর আপনার অ্যাকাউন্টে তাৎক্ষণিকভাবে জিতার টাকা যুক্ত হয়ে যাবে।
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {userBets.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                কোনো বেট হিস্ট্রি পাওয়া যায়নি
              </div>
            ) : (
              userBets.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white block">
                      বেট: ৳ {b.betAmount}
                    </span>
                    <span className="text-[10px] text-slate-500">{b.time}</span>
                  </div>
                  <div className="text-right">
                    {b.won ? (
                      <span className="font-mono font-black text-emerald-400 block">
                        +৳ {b.winAmount.toFixed(2)} ({b.cashedOutMultiplier}x)
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-rose-400 block">
                        -৳ {b.betAmount} (ক্র্যাশ @ {b.roundMultiplier}x)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Win Celebration Modal */}
      <AnimatePresence>
        {winModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs rounded-3xl bg-[#09152b] border border-emerald-500/50 p-6 text-center space-y-3 shadow-2xl relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white">বিজয় অভিনন্দন!</h3>
              <p className="text-xs text-slate-300">
                আপনি সফলভাবে <strong>{winModal.multiplier}x</strong>-এ ক্যাশআউট করেছেন
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-2xl font-black font-mono text-emerald-400">
                +৳ {winModal.amount.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => setWinModal(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                ঠিক আছে
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-game Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#091226]/95 backdrop-blur-md border-t border-slate-800 py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('home') : onBack())}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold">হোম</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('game_win_color') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
          >
            <Palette className="w-4 h-4" />
            <span className="text-[10px] font-bold">উইঙ্গো</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 text-rose-400"
          >
            <Plane className="w-4 h-4 -rotate-45" />
            <span className="text-[10px] font-black">এভিয়েটর</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('deposit') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold">ডিপোজিট</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('profile') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-bold">প্রোফাইল</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
