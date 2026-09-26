import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Volume2,
  Clock,
  BookOpen,
  Wallet,
  VolumeX,
  X,
  Check,
  Minus,
  Plus,
  Trophy,
  Frown,
  Sparkles,
  ArrowRight,
  Pin,
  Flame,
  Dice5,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface DiceRollGameProps {
  onBack: () => void;
}

type TimeMode = '30sec' | '1min' | 'fast';
type HistoryTab = 'game_history' | 'chart' | 'my_history';

interface DiceRound {
  period: string;
  d1: number;
  d2: number;
  d3: number;
  sum: number;
  bigSmall: 'Big' | 'Small';
}

interface UserBet {
  id?: string;
  period: string;
  selection: string;
  betAmount: number;
  winAmount?: number;
  status: 'Pending' | 'Won' | 'Lost';
  time: string;
}

interface RoundResultModalData {
  period: string;
  dices: [number, number, number];
  sum: number;
  bigSmall: 'Big' | 'Small';
  hadBet: boolean;
  isWin: boolean;
  totalWon: number;
  totalLost: number;
  betsDetails: {
    selection: string;
    betAmount: number;
    winAmount: number;
    won: boolean;
  }[];
}

const WinConfettiEffect: React.FC = () => {
  const particles = Array.from({ length: 45 });
  const symbols = ['🪙', '✨', '⭐', '💎', '🎉', '💰', '🎲', '৳'];

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((_, i) => {
        const symbol = symbols[i % symbols.length];
        const left = (i * 2.3 + (i % 7) * 4) % 96;
        const delay = (i * 0.05).toFixed(2);
        const duration = (2.2 + (i % 4) * 0.5).toFixed(2);
        const size = 18 + (i % 5) * 8;

        return (
          <motion.div
            key={i}
            initial={{ y: -60, x: `${left}vw`, rotate: 0, opacity: 1, scale: 0.6 }}
            animate={{
              y: '105vh',
              x: `${left + (i % 2 === 0 ? 6 : -6)}vw`,
              rotate: 360 * (i % 2 === 0 ? 3 : -3),
              opacity: [0, 1, 1, 0.9, 0],
              scale: [0.6, 1.3, 1, 0.9],
            }}
            transition={{
              duration: parseFloat(duration),
              delay: parseFloat(delay),
              ease: 'easeOut',
            }}
            className="absolute select-none drop-shadow-md"
            style={{ fontSize: `${size}px` }}
          >
            {symbol}
          </motion.div>
        );
      })}
    </div>
  );
};

export const DiceRollGame: React.FC<DiceRollGameProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const currentBalance = currentUser ? currentUser.balance : 500;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeMode, setTimeMode] = useState<TimeMode>('30sec');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('game_history');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const [roundResultModal, setRoundResultModal] = useState<RoundResultModalData | null>(null);
  const [recentToast, setRecentToast] = useState<string | null>(null);

  const getInitialSeconds = (mode: TimeMode) => {
    switch (mode) {
      case '30sec':
        return 30;
      case '1min':
        return 60;
      case 'fast':
        return 15;
    }
  };

  const [timeLeft, setTimeLeft] = useState(30);

  const generatePeriodId = (offset = 0) => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const serial = String(40200 + offset).padStart(8, '0');
    return `${yyyy}${mm}${dd}3000${serial}`;
  };

  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(6);
  const currentPeriod = generatePeriodId(currentPeriodOffset);

  const [history, setHistory] = useState<DiceRound[]>([
    { period: generatePeriodId(5), d1: 4, d2: 5, d3: 6, sum: 15, bigSmall: 'Big' },
    { period: generatePeriodId(4), d1: 2, d2: 3, d3: 2, sum: 7, bigSmall: 'Small' },
    { period: generatePeriodId(3), d1: 6, d2: 6, d3: 1, sum: 13, bigSmall: 'Big' },
    { period: generatePeriodId(2), d1: 1, d2: 4, d3: 3, sum: 8, bigSmall: 'Small' },
    { period: generatePeriodId(1), d1: 5, d2: 5, d3: 2, sum: 12, bigSmall: 'Big' },
  ]);

  // Load permanent per-account history from dbStore ("হিস্টরি থাকবে সবসময়ের জন্য")
  const [myBets, setMyBets] = useState<UserBet[]>(() => {
    if (!currentUser) return [];
    return db.getUserGameBets(currentUser.uid, 'dice_roll').map((b) => ({
      id: b.id,
      period: b.period,
      selection: String(b.selection),
      betAmount: b.betAmount,
      winAmount: b.winAmount,
      status: b.status,
      time: b.date,
    }));
  });

  const myBetsRef = useRef<UserBet[]>(myBets);
  myBetsRef.current = myBets;

  useEffect(() => {
    if (currentUser) {
      const records = db.getUserGameBets(currentUser.uid, 'dice_roll');
      setMyBets(
        records.map((b) => ({
          id: b.id,
          period: b.period,
          selection: String(b.selection),
          betAmount: b.betAmount,
          winAmount: b.winAmount,
          status: b.status,
          time: b.date,
        }))
      );
    }
  }, [currentUser]);

  // Active bets for CURRENT round ("যেটাতে ধরবে সেটা থাকবে সবসময় দেখাবে বারবার চেঞ্জ হবে না")
  const activeRoundBets = myBets.filter(
    (b) => b.period === currentPeriod && b.status === 'Pending'
  );

  const getBetAmountOn = (target: string) =>
    activeRoundBets
      .filter((b) => b.selection === target)
      .reduce((sum, b) => sum + b.betAmount, 0);

  const totalActiveBetAmount = activeRoundBets.reduce((a, b) => a + b.betAmount, 0);

  // Bet Modal State
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [activeSelection, setActiveSelection] = useState<string>('Big');
  const [baseUnit, setBaseUnit] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  const isLocked = timeLeft <= 5;

  const playAudioFeedback = (type: 'win' | 'loss') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const d1 = Math.floor(1 + Math.random() * 6);
          const d2 = Math.floor(1 + Math.random() * 6);
          const d3 = Math.floor(1 + Math.random() * 6);
          const sum = d1 + d2 + d3;
          const bigSmall: 'Big' | 'Small' = sum >= 11 ? 'Big' : 'Small';
          const isEven = sum % 2 === 0;

          const completedPeriod = generatePeriodId(currentPeriodOffset);

          setHistory((h) => [{ period: completedPeriod, d1, d2, d3, sum, bigSmall }, ...h.slice(0, 19)]);
          setCurrentPeriodOffset((c) => c + 1);

          const roundBets = myBetsRef.current.filter(
            (b) => b.period === completedPeriod && b.status === 'Pending'
          );

          let roundTotalWon = 0;
          let roundTotalLost = 0;
          const processedDetails: any[] = [];

          setMyBets((prevBets) =>
            prevBets.map((b) => {
              if (b.period === completedPeriod && b.status === 'Pending') {
                let won = false;
                let multiplier = 2;

                if (b.selection === 'Big' && bigSmall === 'Big') won = true;
                else if (b.selection === 'Small' && bigSmall === 'Small') won = true;
                else if (b.selection === 'Even' && isEven) won = true;
                else if (b.selection === 'Odd' && !isEven) won = true;
                else if (b.selection === `Dice ${d1}` || b.selection === `Dice ${d2}` || b.selection === `Dice ${d3}`) {
                  won = true;
                  multiplier = 4;
                }

                const payout = won ? b.betAmount * multiplier : 0;
                if (won) {
                  roundTotalWon += payout;
                  if (currentUser) {
                    db.adjustUserBalance(
                      currentUser.uid,
                      payout,
                      `Dice Roll রাউন্ড #${completedPeriod.slice(-4)} (${b.selection}) জয় (${payout} ৳)`,
                      'Dice Game'
                    );
                  }
                } else {
                  roundTotalLost += b.betAmount;
                }

                if (currentUser && b.id) {
                  db.updateUserGameBet(b.id, {
                    status: won ? 'Won' : 'Lost',
                    winAmount: payout,
                    result: `${d1}, ${d2}, ${d3} (${sum} ${bigSmall})`,
                  });
                }

                processedDetails.push({
                  selection: b.selection,
                  betAmount: b.betAmount,
                  winAmount: payout,
                  won,
                });

                return {
                  ...b,
                  status: won ? 'Won' : 'Lost',
                  winAmount: payout,
                };
              }
              return b;
            })
          );

          if (roundBets.length > 0) {
            const isWin = roundTotalWon > 0;
            playAudioFeedback(isWin ? 'win' : 'loss');

            if (isWin && typeof window !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([150, 70, 150, 70, 300]);
              } catch {}
            }

            setRoundResultModal({
              period: completedPeriod,
              dices: [d1, d2, d3],
              sum,
              bigSmall,
              hadBet: true,
              isWin,
              totalWon: roundTotalWon,
              totalLost: roundTotalLost,
              betsDetails: processedDetails,
            });
          } else {
            setRecentToast(`রাউন্ড #${completedPeriod.slice(-4)}: ডাইস ${d1}, ${d2}, ${d3} (মোট ${sum} - ${bigSmall})`);
            setTimeout(() => setRecentToast(null), 3500);
          }

          return getInitialSeconds(timeMode);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeMode, currentPeriodOffset, currentUser, soundEnabled]);

  const handleSelectMode = (mode: TimeMode) => {
    setTimeMode(mode);
    setTimeLeft(getInitialSeconds(mode));
  };

  const openBetModal = (target: string) => {
    if (isLocked) {
      alert('রাউন্ড বন্ধ হতে ৫ সেকেন্ড বাকি, পরের রাউন্ডের জন্য অপেক্ষা করুন!');
      return;
    }
    setActiveSelection(target);
    setBaseUnit(10);
    setQuantity(selectedMultiplier || 1);
    setBetModalOpen(true);
  };

  const handleConfirmBet = () => {
    const totalCost = baseUnit * quantity;
    if (currentBalance < totalCost) {
      alert(`আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই! প্রয়োজন ৳ ${totalCost}, বর্তমান ব্যালেন্স ৳ ${currentBalance.toFixed(2)}। ডিপোজিট করুন।`);
      return;
    }

    let savedId = `BET-${Date.now()}`;
    if (currentUser) {
      db.adjustUserBalance(
        currentUser.uid,
        -totalCost,
        `Dice Roll রাউন্ড #${currentPeriod} বেট (${activeSelection})`,
        'Dice Game'
      );

      const savedRecord = db.addUserGameBet({
        uid: currentUser.uid,
        gameCode: 'dice_roll',
        gameName: 'Dice Roll (ডাইস গেম)',
        period: currentPeriod,
        selection: activeSelection,
        betAmount: totalCost,
        winAmount: 0,
        status: 'Pending',
        date: new Date().toLocaleTimeString(),
      });
      savedId = savedRecord.id;
    }

    const newBet: UserBet = {
      id: savedId,
      period: currentPeriod,
      selection: activeSelection,
      betAmount: totalCost,
      status: 'Pending',
      time: new Date().toLocaleTimeString(),
    };

    setMyBets((prev) => [newBet, ...prev]);
    setBetModalOpen(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-800 pb-20 select-none relative">
      {roundResultModal?.isWin && <WinConfettiEffect />}

      {/* 1. Header with Crimson/Orange Gradient */}
      <div className="relative bg-gradient-to-b from-[#e11d48] via-[#f43f5e] to-[#be123c] pb-6 pt-3 px-4 shadow-sm text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="p-1 text-white hover:text-slate-200 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-sm italic shadow-sm bg-white/20">
              <Dice5 className="w-4 h-4" />
            </div>
            <span className="text-xl font-black italic tracking-wider text-white drop-shadow-sm">
              DICE ROLL
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-white">
            <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-inner">
              <Wallet className="w-3.5 h-3.5 text-white" />
              <span className="font-mono">৳ {currentBalance.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-full text-white/90 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="mt-3 bg-white rounded-full px-3 py-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2 text-slate-700">
            <Volume2 className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="overflow-hidden whitespace-nowrap text-xs font-medium">
              <span className="inline-block animate-marquee">
                🎲 ক্লাসিক ডাইস রোল! Big/Small এবং জোড়/বিজোড় ধরে ২ গুণ ও স্পেসিফিক ডাইসে ৪ গুণ বোনাস পান!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="bg-[#e11d48] hover:bg-[#be123c] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-xs active:scale-95"
          >
            Rules
          </button>
        </div>
      </div>

      <div className="px-3.5 -mt-3 relative z-10 space-y-3">
        {/* Floating toast */}
        <AnimatePresence>
          {recentToast && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-slate-900 text-white text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-slate-700 text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{recentToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Mode Selectors */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 grid grid-cols-3 gap-1.5">
          {[
            { id: '30sec', label: 'Dice\n30sec' },
            { id: '1min', label: 'Dice 1\nMin' },
            { id: 'fast', label: 'Fast Roll\n15sec' },
          ].map((mode) => {
            const isActive = timeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelectMode(mode.id as TimeMode)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-[#e11d48] text-white shadow-md font-bold'
                    : 'text-slate-500 hover:bg-slate-50 font-medium'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                    isActive
                      ? 'border-white bg-white/20 text-white'
                      : 'border-slate-300 bg-slate-100 text-slate-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] leading-tight text-center whitespace-pre-line">
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Card with Countdown & Recent Dices */}
        <div className="bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#be123c] rounded-3xl p-3.5 shadow-md text-white relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2 flex-1 pr-2">
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/60 bg-white/10 text-white text-xs font-semibold backdrop-blur-xs active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to play</span>
            </button>

            <div className="text-xs font-bold text-white/90">Dice 3D Roll</div>

            <div className="flex items-center gap-1 pt-0.5">
              {history.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-white text-rose-700 font-bold font-mono text-[10px] shadow-sm"
                >
                  {item.sum} ({item.bigSmall[0]})
                </div>
              ))}
            </div>
          </div>

          <div className="h-16 w-[1px] border-r-2 border-dotted border-white/40 mx-2" />

          <div className="flex flex-col items-end pl-2">
            <span className="text-[11px] font-bold text-white/90 mb-1">Time remaining</span>
            <div className="flex items-center gap-1 text-slate-900 font-mono font-black text-sm">
              <div className="w-5 h-7 rounded-sm bg-white shadow-xs flex items-center justify-center">
                {m1}
              </div>
              <div className="w-5 h-7 rounded-sm bg-white shadow-xs flex items-center justify-center">
                {m2}
              </div>
              <span className="text-white text-base font-bold pb-1">:</span>
              <div className="w-5 h-7 rounded-sm bg-white shadow-xs flex items-center justify-center">
                {s1}
              </div>
              <div className="w-5 h-7 rounded-sm bg-white shadow-xs flex items-center justify-center">
                {s2}
              </div>
            </div>
            <div className="text-[11px] font-mono font-bold text-white/95 mt-2 tracking-tight">
              {currentPeriod}
            </div>
          </div>
        </div>

        {/* PERSISTENT ACTIVE BETS BAR ("যেটাতে ধরবে সেটা থাকবে সবসময় দেখাবে বারবার চেঞ্জ হবে না") */}
        {activeRoundBets.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500/15 via-pink-500/15 to-rose-500/15 border-2 border-rose-400/70 rounded-2xl p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-rose-950">
              <div className="flex items-center gap-1.5">
                <Pin className="w-4 h-4 text-rose-600" />
                <span>আপনার বর্তমান রাউন্ডের বেট (স্থায়ী থাকবে):</span>
              </div>
              <span className="text-[11px] font-mono font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                মোট ৳ {totalActiveBetAmount}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRoundBets.map((b, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white border border-rose-300/80 text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-rose-700 font-black">✓ {b.selection}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-rose-800 font-black">৳ {b.betAmount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Countdown Overlay during last 5 seconds */}
        <div className="relative">
          {isLocked && (
            <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center text-white space-y-1">
              <span className="text-xs font-bold text-amber-300">রাউন্ড বন্ধ হচ্ছে</span>
              <div className="text-5xl font-black font-mono animate-bounce text-white drop-shadow-md">
                {timeLeft}
              </div>
            </div>
          )}

          {/* Big / Small & Odd / Even Selection */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('Big')}
              className={`py-3 px-2 rounded-2xl bg-gradient-to-r from-[#ff9b36] to-[#f78214] text-white font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                getBetAmountOn('Big') > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>Big (১১-১৮)</span>
              {getBetAmountOn('Big') > 0 && (
                <span className="text-[10px] font-mono font-black bg-white text-amber-700 px-2 py-0.2 rounded-full">
                  ✓ ৳{getBetAmountOn('Big')}
                </span>
              )}
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('Small')}
              className={`py-3 px-2 rounded-2xl bg-gradient-to-r from-[#59b8ff] to-[#3a9ef0] text-white font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                getBetAmountOn('Small') > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>Small (৩-১০)</span>
              {getBetAmountOn('Small') > 0 && (
                <span className="text-[10px] font-mono font-black bg-white text-sky-700 px-2 py-0.2 rounded-full">
                  ✓ ৳{getBetAmountOn('Small')}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('Even')}
              className={`py-2.5 px-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                getBetAmountOn('Even') > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>জোড় (Even) ২X</span>
              {getBetAmountOn('Even') > 0 && (
                <span className="text-[10px] font-mono font-black bg-amber-400 text-purple-950 px-1.5 py-0.2 rounded-md">
                  ✓ ৳{getBetAmountOn('Even')}
                </span>
              )}
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('Odd')}
              className={`py-2.5 px-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                getBetAmountOn('Odd') > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>বিজোড় (Odd) ২X</span>
              {getBetAmountOn('Odd') > 0 && (
                <span className="text-[10px] font-mono font-black bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded-md">
                  ✓ ৳{getBetAmountOn('Odd')}
                </span>
              )}
            </button>
          </div>

          {/* Specific Dice Face 1 to 6 */}
          <div className="bg-[#f8f9fc] rounded-3xl p-3 border border-slate-200/60 shadow-sm mt-3">
            <div className="text-xs font-bold text-slate-500 mb-2 px-1 flex items-center justify-between">
              <span>নির্দিষ্ট ডাইস নম্বর (১ - ৬):</span>
              <span className="text-rose-600 font-black">৪ গুণ লাভ (4X Payout)</span>
            </div>
            <div className="grid grid-cols-6 gap-2 justify-items-center">
              {[1, 2, 3, 4, 5, 6].map((d) => {
                const targetName = `Dice ${d}`;
                const betOnThis = getBetAmountOn(targetName);
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isLocked}
                    onClick={() => openBetModal(targetName)}
                    className={`w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center relative active:scale-95 ${
                      betOnThis > 0 ? 'ring-2 ring-rose-500 border-rose-500' : ''
                    }`}
                  >
                    {betOnThis > 0 && (
                      <span className="absolute -top-1.5 -right-1 z-10 px-1 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[8px]">
                        ৳{betOnThis}
                      </span>
                    )}
                    <span className="text-base font-black text-rose-600 font-mono">🎲 {d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multipliers */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {[1, 5, 10, 20, 50, 100].map((mul) => {
              const isSelected = selectedMultiplier === mul;
              return (
                <button
                  key={mul}
                  type="button"
                  onClick={() => setSelectedMultiplier(mul)}
                  className={`px-3 py-1 rounded-md text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  X{mul}
                </button>
              );
            })}
          </div>
        </div>

        {/* History Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setHistoryTab('game_history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              historyTab === 'game_history'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Game history
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab('chart')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              historyTab === 'chart'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Chart
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab('my_history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              historyTab === 'my_history'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            My history
          </button>
        </div>

        {/* Tables */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {historyTab === 'game_history' && (
            <div>
              <div className="bg-rose-600 text-white font-bold text-xs grid grid-cols-4 py-2.5 px-3 text-center">
                <span className="text-left">Period</span>
                <span>Dices</span>
                <span>Sum</span>
                <span>Result</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {history.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 py-2.5 px-3 items-center text-center hover:bg-slate-50"
                  >
                    <span className="text-slate-600 font-mono text-[11px] text-left">
                      {row.period}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {row.d1}, {row.d2}, {row.d3}
                    </span>
                    <span className="font-mono font-black text-rose-600">{row.sum}</span>
                    <span className="font-bold text-amber-600">{row.bigSmall}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {historyTab === 'chart' && (
            <div className="p-4 text-center space-y-3">
              <span className="text-xs font-bold text-slate-500">ডাইস রেজাল্ট ট্রেন্ড</span>
              <div className="flex items-center justify-center gap-2 flex-wrap py-2">
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 font-black font-mono text-xs flex items-center justify-center border border-rose-200">
                      {h.sum}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{h.period.slice(-3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permanent My History ("হিস্টরি থাকবে সবসময়ের জন্য") */}
          {historyTab === 'my_history' && (
            <div className="p-3 text-xs">
              {myBets.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-1">
                  <p>এখনো কোনো ডাইস বেট করেননি!</p>
                  <p className="text-[10px]">উপরে Big/Small বা নির্দিষ্ট ডাইস নির্বাচন করুন।</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myBets.map((b, i) => {
                    const isWin = b.status === 'Won';
                    const isLost = b.status === 'Lost';
                    const isPending = b.status === 'Pending';

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl border transition-all ${
                          isWin
                            ? 'bg-emerald-50/80 border-emerald-300/80 shadow-xs'
                            : isLost
                            ? 'bg-rose-50/80 border-rose-300/80'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-white bg-rose-600">
                              {b.selection}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              #{b.period.slice(-6)}
                            </span>
                          </div>

                          <div>
                            {isWin && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                                <Trophy className="w-3 h-3" />
                                <span>🎉 জয় (WIN)</span>
                              </span>
                            )}
                            {isLost && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs">
                                <span>❌ লস (LOSS)</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                                <span>⌛ চলছে...</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                          <div className="text-slate-500 text-[11px]">
                            বেট:{' '}
                            <span className="font-mono font-bold text-slate-700">
                              ৳ {b.betAmount}
                            </span>{' '}
                            • {b.time}
                          </div>
                          <div>
                            {isWin && (
                              <span className="font-mono font-black text-emerald-600 text-sm">
                                + ৳ {b.winAmount}
                              </span>
                            )}
                            {isLost && (
                              <span className="font-mono font-black text-rose-600 text-sm">
                                - ৳ {b.betAmount} (লস)
                              </span>
                            )}
                            {isPending && (
                              <span className="font-mono text-slate-500 text-xs">
                                ফলাফল বাকি
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bet Modal */}
      <AnimatePresence>
        {betModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-4 space-y-3.5 shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-black text-white bg-rose-600">
                    {activeSelection} নির্বাচন
                  </span>
                  <span className="text-xs text-rose-600 font-bold">Dice Roll</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBetModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">বেট পরিমাণ</span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBaseUnit(amt)}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                        baseUnit === amt
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {amt} ৳
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Quantity (গুণক)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                  {[1, 5, 10, 20, 50, 100].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setQuantity(m)}
                      className={`px-3 py-1 rounded-md text-xs font-bold shrink-0 ${
                        quantity === m
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      X{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    agreeTerms
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span>I agree to PRE-SALE RULES</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBetModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBet}
                  className="flex-[2] py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Total amount ৳ {baseUnit * quantity}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Win/Loss Modal */}
      <AnimatePresence>
        {roundResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl text-center border relative ${
                roundResultModal.isWin
                  ? 'bg-gradient-to-b from-[#0e2c1e] via-[#091f15] to-[#040e0a] border-emerald-400/80 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-b from-[#2a1017] via-[#1c090e] to-[#0d0407] border-rose-500/60 text-white shadow-rose-500/30'
              }`}
            >
              {roundResultModal.isWin && (
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-[70px] pointer-events-none" />
              )}

              <div
                className={`py-5 px-6 flex flex-col items-center justify-center relative overflow-hidden ${
                  roundResultModal.isWin
                    ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border-2 border-white/60 mb-1.5 animate-bounce">
                  {roundResultModal.isWin ? (
                    <Trophy className="w-9 h-9 text-amber-200 drop-shadow-md" />
                  ) : (
                    <Frown className="w-9 h-9 text-white drop-shadow-md" />
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {roundResultModal.isWin && (
                    <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                  )}
                  <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                    {roundResultModal.isWin
                      ? '🎉 CONGRATULATIONS! জিতেছেন!'
                      : '💔 দুঃখিত! আপনি হেরেছেন (Loss)!'}
                  </h2>
                </div>
                <span className="text-[11px] text-white/95 font-medium mt-0.5">
                  রাউন্ড #{roundResultModal.period.slice(-6)} ফলাফল
                </span>
              </div>

              <div className="p-5 space-y-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-xs text-slate-300 font-bold">ডাইস ফলাফল:</span>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {roundResultModal.dices.map((d, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-2xl bg-white text-rose-600 font-black font-mono text-xl flex items-center justify-center shadow-lg border-2 border-white/80"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 text-xs font-bold text-amber-300">
                    মোট: {roundResultModal.sum} ({roundResultModal.bigSmall})
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg ${
                    roundResultModal.isWin
                      ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300'
                      : 'bg-rose-500/25 border-rose-500/60 text-rose-300'
                  }`}
                >
                  <span className="text-xs font-bold block uppercase tracking-wider">
                    {roundResultModal.isWin
                      ? 'আপনার মোট লাভ (WIN AMOUNT):'
                      : 'আপনার লস (LOST AMOUNT):'}
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                    {roundResultModal.isWin
                      ? `+ ৳ ${roundResultModal.totalWon.toFixed(2)}`
                      : `- ৳ ${roundResultModal.totalLost.toFixed(2)}`}
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-2.5 text-xs text-left space-y-1 border border-white/15">
                  <div className="text-slate-300 font-bold text-[11px]">আপনার ধরা অপশন:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {roundResultModal.betsDetails.map((b, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          b.won
                            ? 'bg-emerald-500/40 text-emerald-200 border border-emerald-400'
                            : 'bg-rose-500/40 text-rose-200 border border-rose-400'
                        }`}
                      >
                        {b.selection} (৳ {b.betAmount}) → {b.won ? `+৳ ${b.winAmount}` : 'লস'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-between px-1">
                  <span>বর্তমান একাউন্ট ব্যালেন্স:</span>
                  <span className="font-mono font-black text-emerald-300 text-sm">
                    ৳ {currentBalance.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setRoundResultModal(null)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    roundResultModal.isWin
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-slate-950 shadow-emerald-500/40 hover:brightness-110'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/30 hover:brightness-110'
                  }`}
                >
                  <span>
                    {roundResultModal.isWin
                      ? 'ধন্যবাদ! পরের রাউন্ড খেলুন'
                      : 'পরের রাউন্ডে আবার চেষ্টা করুন'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rules modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-rose-600">📖 Dice Roll খেলার নিয়মাবলী</h3>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>১. Big / Small (২ গুণ):</strong> ৩টি ডাইসের মোট যোগফল ১১ থেকে ১৮ হলে Big, ৩
                থেকে ১০ হলে Small।
              </p>
              <p>
                <strong>২. জোড় / বিজোড় (Even/Odd - ২ গুণ):</strong> মোট যোগফল জোড় বা বিজোড় হলে ২
                গুণ লাভ।
              </p>
              <p>
                <strong>৩. নির্দিষ্ট ডাইস (৪ গুণ):</strong> যেকোনো সংখ্যা (১ থেকে ৬) আসলে পাবেন ৪ গুণ
                লাভ।
              </p>
              <p>
                <strong>৪. স্থায়ী হিস্ট্রি:</strong> আপনার প্রতিটি ডাইস বেট স্থায়ীভাবে আপনার
                অ্যাকাউন্টে সেভ থাকবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
