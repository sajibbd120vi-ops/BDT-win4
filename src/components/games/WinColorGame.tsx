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
  Home,
  User,
  CreditCard,
  Receipt,
  Plane,
  Cpu,
  Radio,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';

interface WinColorGameProps {
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

type TimeMode = 'ai_30s' | 'live_30s' | 'ai_1m' | 'live_3m';
type HistoryTab = 'game_history' | 'chart' | 'my_history';

interface WinGoRound {
  period: string;
  number: number;
  bigSmall: 'Big' | 'Small';
  color: 'red' | 'green' | 'violet' | 'red_violet' | 'green_violet';
}

interface UserBet {
  id?: string;
  period: string;
  type: string;
  selection: string | number;
  betAmount: number;
  winAmount?: number;
  status: 'Pending' | 'Won' | 'Lost';
  time: string;
}

interface RoundResultModalData {
  period: string;
  winningNum: number;
  winningColor: 'red' | 'green' | 'violet' | 'red_violet' | 'green_violet';
  winningSize: 'Big' | 'Small';
  hadBet: boolean;
  isWin: boolean;
  totalWon: number;
  totalLost: number;
  betsDetails: {
    selection: string | number;
    betAmount: number;
    winAmount: number;
    won: boolean;
  }[];
}

// Spectacular Win Confetti & Falling Coins Effect
const WinConfettiEffect: React.FC = () => {
  const particles = Array.from({ length: 45 });
  const symbols = ['🪙', '✨', '⭐', '💎', '🎉', '💰', '৳'];

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

export const WinColorGame: React.FC<WinColorGameProps> = ({ onBack, onNavigate }) => {
  const { currentUser } = useAuth();
  const currentBalance = currentUser ? currentUser.balance : 500;

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeMode, setTimeMode] = useState<TimeMode>('ai_30s');
  const [historyTab, setHistoryTab] = useState<HistoryTab>('game_history');

  // How to play modal
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Result popup modal & toasts
  const [roundResultModal, setRoundResultModal] = useState<RoundResultModalData | null>(null);
  const [recentToast, setRecentToast] = useState<string | null>(null);

  // Last completed bet summary for quick top indicator
  const [lastCompletedBet, setLastCompletedBet] = useState<{
    period: string;
    isWin: boolean;
    amount: number;
  } | null>(null);

  // Time durations
  const getInitialSeconds = (mode: TimeMode) => {
    switch (mode) {
      case 'ai_30s':
      case 'live_30s':
        return 30;
      case 'ai_1m':
        return 60;
      case 'live_3m':
        return 180;
    }
  };

  const [timeLeft, setTimeLeft] = useState(30);

  // Generates current period number like 20260926100050505
  const generatePeriodId = (offset = 0) => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const serial = String(50505 + offset).padStart(8, '0');
    return `${yyyy}${mm}${dd}1000${serial}`;
  };

  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(5);
  const currentPeriod = generatePeriodId(currentPeriodOffset);

  // Initial history matching the screenshot (2, 2, 4, 0, 9)
  const [history, setHistory] = useState<WinGoRound[]>([
    { period: generatePeriodId(4), number: 2, bigSmall: 'Small', color: 'red' },
    { period: generatePeriodId(3), number: 2, bigSmall: 'Small', color: 'red' },
    { period: generatePeriodId(2), number: 4, bigSmall: 'Small', color: 'red' },
    { period: generatePeriodId(1), number: 0, bigSmall: 'Small', color: 'red_violet' },
    { period: generatePeriodId(0), number: 9, bigSmall: 'Big', color: 'green' },
    { period: generatePeriodId(-1), number: 7, bigSmall: 'Big', color: 'green' },
    { period: generatePeriodId(-2), number: 6, bigSmall: 'Big', color: 'red' },
    { period: generatePeriodId(-3), number: 3, bigSmall: 'Small', color: 'green' },
    { period: generatePeriodId(-4), number: 8, bigSmall: 'Big', color: 'red' },
    { period: generatePeriodId(-5), number: 5, bigSmall: 'Big', color: 'green_violet' },
  ]);

  const [myBets, setMyBets] = useState<UserBet[]>(() => {
    if (!currentUser) return [];
    return db.getUserGameBets(currentUser.uid, 'win_color').map((b) => ({
      id: b.id,
      period: b.period,
      type: 'color',
      selection: b.selection,
      betAmount: b.betAmount,
      winAmount: b.winAmount,
      status: b.status,
      time: b.date,
    }));
  });
  const myBetsRef = useRef<UserBet[]>(myBets);
  myBetsRef.current = myBets;

  // Sync permanent bets when user switches account
  useEffect(() => {
    if (currentUser) {
      const records = db.getUserGameBets(currentUser.uid, 'win_color');
      setMyBets(
        records.map((b) => ({
          id: b.id,
          period: b.period,
          type: 'color',
          selection: b.selection,
          betAmount: b.betAmount,
          winAmount: b.winAmount,
          status: b.status,
          time: b.date,
        }))
      );
    }
  }, [currentUser]);

  // Active bets placed for the CURRENT round
  // ("যেটাতে ধরবে সেটা থাকবে সবসময় দেখাবে বারবার চেঞ্জ হবে না")
  const activeRoundBets = myBets.filter(
    (b) => b.period === currentPeriod && b.status === 'Pending'
  );

  const greenBetAmount = activeRoundBets
    .filter((b) => b.selection === 'green')
    .reduce((sum, b) => sum + b.betAmount, 0);

  const violetBetAmount = activeRoundBets
    .filter((b) => b.selection === 'violet')
    .reduce((sum, b) => sum + b.betAmount, 0);

  const redBetAmount = activeRoundBets
    .filter((b) => b.selection === 'red')
    .reduce((sum, b) => sum + b.betAmount, 0);

  const bigBetAmount = activeRoundBets
    .filter((b) => b.selection === 'Big')
    .reduce((sum, b) => sum + b.betAmount, 0);

  const smallBetAmount = activeRoundBets
    .filter((b) => b.selection === 'Small')
    .reduce((sum, b) => sum + b.betAmount, 0);

  const getNumberBetAmount = (num: number) =>
    activeRoundBets
      .filter((b) => Number(b.selection) === num)
      .reduce((sum, b) => sum + b.betAmount, 0);

  const totalActiveBetAmount = activeRoundBets.reduce((a, b) => a + b.betAmount, 0);

  // Bet Sheet state
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [activeBetType, setActiveBetType] = useState<'color' | 'number' | 'size'>('color');
  const [activeSelection, setActiveSelection] = useState<string | number>('green');
  const [baseUnit, setBaseUnit] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Multipliers chips: X1, X5, X10, X20, X50, X100
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  // Lock period during last 5 seconds
  const isLocked = timeLeft <= 5;

  // Sound synthesis: "উইনবাবা" (Celebratory Victory Fanfare)
  const playWinBabaSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Sparkling joyful ascending arpeggio (C5, E5, G5, C6, E6)
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
      });
    } catch {
      // Audio not permitted without interaction
    }
  };

  // Sound synthesis: "লাশ পোপা" (Playful Comical Loss Boop & Pop)
  const playLossPopaSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Descending comical pitch drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(175, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);

      // Subsequent twin "pop-pop" thuds
      [0.34, 0.44].forEach((timeOffset, i) => {
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(i === 0 ? 160 : 110, ctx.currentTime + timeOffset);
        popGain.gain.setValueAtTime(0.18, ctx.currentTime + timeOffset);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.09);

        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(ctx.currentTime + timeOffset);
        popOsc.stop(ctx.currentTime + timeOffset + 0.09);
      });
    } catch {
      // Audio not permitted without interaction
    }
  };

  const playAudioFeedback = (type: 'win' | 'loss') => {
    if (type === 'win') {
      playWinBabaSound();
    } else {
      playLossPopaSound();
    }
  };

  // Handle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Resolve round
          const winningNum = Math.floor(Math.random() * 10);
          let winningColor: 'red' | 'green' | 'violet' | 'red_violet' | 'green_violet' = 'red';
          if (winningNum === 0) winningColor = 'red_violet';
          else if (winningNum === 5) winningColor = 'green_violet';
          else if (winningNum % 2 === 0) winningColor = 'red';
          else winningColor = 'green';

          const winningSize: 'Big' | 'Small' = winningNum >= 5 ? 'Big' : 'Small';

          const completedPeriod = generatePeriodId(currentPeriodOffset);

          const newRound: WinGoRound = {
            period: completedPeriod,
            number: winningNum,
            bigSmall: winningSize,
            color: winningColor,
          };

          setHistory((h) => [newRound, ...h.slice(0, 19)]);
          setCurrentPeriodOffset((c) => c + 1);

          // Resolve pending bets of this round synchronously
          const roundBets = myBetsRef.current.filter(
            (b) => b.period === completedPeriod && b.status === 'Pending'
          );

          let roundTotalWon = 0;
          let roundTotalLost = 0;
          const processedDetails: any[] = [];
          const betOutcomeMap = new Map<string, { won: boolean; payout: number }>();

          for (const b of roundBets) {
            let won = false;
            let payoutMultiplier = 0;

            if (b.type === 'color') {
              if (
                b.selection === 'violet' &&
                (winningColor === 'red_violet' || winningColor === 'green_violet')
              ) {
                won = true;
                payoutMultiplier = 4.5;
              } else if (
                b.selection === winningColor ||
                (winningColor === 'red_violet' && b.selection === 'red') ||
                (winningColor === 'green_violet' && b.selection === 'green')
              ) {
                won = true;
                payoutMultiplier = 2;
              }
            } else if (b.type === 'size') {
              if (b.selection === winningSize) {
                won = true;
                payoutMultiplier = 2;
              }
            } else if (b.type === 'number') {
              if (Number(b.selection) === winningNum) {
                won = true;
                payoutMultiplier = 9;
              }
            }

            const payout = won ? b.betAmount * payoutMultiplier : 0;
            if (won) {
              roundTotalWon += payout;
            } else {
              roundTotalLost += b.betAmount;
            }

            if (b.id) {
              betOutcomeMap.set(b.id, { won, payout });
            }

            processedDetails.push({
              selection: b.selection,
              betAmount: b.betAmount,
              winAmount: payout,
              won,
            });

            if (currentUser && b.id) {
              db.updateUserGameBet(b.id, {
                status: won ? 'Won' : 'Lost',
                winAmount: payout,
                result: `${winningNum} (${winningColor}, ${winningSize})`,
              });
            }
          }

          if (roundTotalWon > 0 && currentUser) {
            db.adjustUserBalance(
              currentUser.uid,
              roundTotalWon,
              `WinGo রাউন্ড #${completedPeriod.slice(-4)} জয় (+${roundTotalWon} ৳)`,
              'WinGo Game'
            );
          }

          setMyBets((prevBets) =>
            prevBets.map((b) => {
              if (b.period === completedPeriod && b.status === 'Pending') {
                const outcome = b.id ? betOutcomeMap.get(b.id) : null;
                const won = outcome ? outcome.won : false;
                const payout = outcome ? outcome.payout : 0;
                return {
                  ...b,
                  status: won ? 'Won' : 'Lost',
                  winAmount: payout,
                };
              }
              return b;
            })
          );

          // If user had a bet in this completed round, display WIN or LOSS Modal with sound
          if (roundBets.length > 0) {
            const isWin = roundTotalWon > 0;
            playAudioFeedback(isWin ? 'win' : 'loss');

            // Haptic vibration feedback on winning!
            if (isWin && typeof window !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([150, 70, 150, 70, 300]);
              } catch {}
            }

            setLastCompletedBet({
              period: completedPeriod,
              isWin,
              amount: isWin ? roundTotalWon : roundTotalLost,
            });

            setRoundResultModal({
              period: completedPeriod,
              winningNum,
              winningColor,
              winningSize,
              hadBet: true,
              isWin,
              totalWon: roundTotalWon,
              totalLost: roundTotalLost,
              betsDetails: processedDetails,
            });
          } else {
            // User had no bet in this round: show clean info notification
            setRecentToast(
              `রাউন্ড #${completedPeriod.slice(-4)}: ফলাফল ${winningNum} (${
                winningColor === 'red' ? 'Red' : winningColor === 'green' ? 'Green' : 'Violet'
              }, ${winningSize})`
            );
            setTimeout(() => setRecentToast(null), 3500);
          }

          return getInitialSeconds(timeMode);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeMode, currentPeriodOffset, currentUser, soundEnabled]);

  // Mode change handler
  const handleSelectMode = (mode: TimeMode) => {
    setTimeMode(mode);
    setTimeLeft(getInitialSeconds(mode));
  };

  // Open Bet Sheet
  const openBetModal = (type: 'color' | 'number' | 'size', value: string | number) => {
    if (isLocked) {
      alert('রাউন্ড বন্ধ হতে ৫ সেকেন্ড বাকি, পরের রাউন্ডের জন্য অপেক্ষা করুন!');
      return;
    }
    setActiveBetType(type);
    setActiveSelection(value);
    setBaseUnit(10);
    setQuantity(selectedMultiplier || 1);
    setBetModalOpen(true);
  };

  // Confirm Bet
  const handleConfirmBet = () => {
    const totalCost = baseUnit * quantity;
    if (currentBalance < totalCost) {
      alert(
        `আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই! প্রয়োজন ৳ ${totalCost}, বর্তমান ব্যালেন্স ৳ ${currentBalance.toFixed(
          2
        )}। ডিপোজিট করুন।`
      );
      return;
    }

    let savedId = `BET-${Date.now()}`;
    if (currentUser) {
      db.adjustUserBalance(
        currentUser.uid,
        -totalCost,
        `WinGo রাউন্ড #${currentPeriod} বেট (${activeSelection})`,
        'WinGo Game'
      );

      const savedRecord = db.addUserGameBet({
        uid: currentUser.uid,
        gameCode: 'win_color',
        gameName: 'WinGo (DX WIN)',
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
      type: activeBetType,
      selection: activeSelection,
      betAmount: totalCost,
      status: 'Pending',
      time: new Date().toLocaleTimeString(),
    };

    setMyBets((prev) => [newBet, ...prev]);
    setBetModalOpen(false);
  };

  // Multiplier click helper in main UI
  const handleMultiplierChange = (mul: number) => {
    setSelectedMultiplier(mul);
  };

  // Format countdown into 4 digital boxes [0] [0] : [0] [9]
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const m1 = Math.floor(minutes / 10);
  const m2 = minutes % 10;
  const s1 = Math.floor(seconds / 10);
  const s2 = seconds % 10;

  // Ball Color Resolver
  const renderMiniBall = (num: number, color: string) => {
    if (color === 'red_violet' || num === 0) {
      return (
        <div className="w-5 h-5 rounded-full relative overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-rose-500" />
          <span className="relative z-10">{num}</span>
        </div>
      );
    }
    if (color === 'green_violet' || num === 5) {
      return (
        <div className="w-5 h-5 rounded-full relative overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-purple-500 to-purple-600" />
          <span className="relative z-10">{num}</span>
        </div>
      );
    }
    const isGreen = color === 'green';
    return (
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/60 ${
          isGreen
            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
            : 'bg-gradient-to-b from-rose-400 to-rose-600'
        }`}
      >
        <span>{num}</span>
      </div>
    );
  };

  // Number 3D Ball Renderer (0-9) with Persistent Selection Marker
  const renderNumberBall = (n: number) => {
    const betOnThisNum = getNumberBetAmount(n);
    let bgGradient = 'from-emerald-400 to-emerald-600';
    let isSplit = false;
    let splitGradient = '';

    if (n === 0) {
      isSplit = true;
      splitGradient = 'bg-gradient-to-tr from-purple-600 via-rose-500 to-rose-500';
    } else if (n === 5) {
      isSplit = true;
      splitGradient = 'bg-gradient-to-tr from-emerald-500 via-purple-500 to-purple-600';
    } else if (n % 2 === 0) {
      bgGradient = 'from-rose-400 via-rose-500 to-rose-600';
    } else {
      bgGradient = 'from-emerald-400 via-emerald-500 to-emerald-600';
    }

    return (
      <button
        key={n}
        type="button"
        disabled={isLocked}
        onClick={() => openBetModal('number', n)}
        className="group relative flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
      >
        {/* Persistent Bet Badge on the Ball ("যেটাতে ধরবে সেটা থাকবে সবসময় দেখাবে বারবার চেঞ্জ হবে না") */}
        {betOnThisNum > 0 && (
          <div className="absolute -top-1.5 -right-1 z-30 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-md border-2 border-white font-mono animate-pulse">
            ✓ ৳{betOnThisNum}
          </div>
        )}

        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full p-1 shadow-md flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 ${
            betOnThisNum > 0 ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-[#f8f9fc]' : ''
          } ${isSplit ? splitGradient : `bg-gradient-to-br ${bgGradient}`}`}
        >
          {/* Outer glossy highlight */}
          <div className="absolute top-1 left-2 w-5 h-2.5 bg-white/40 rounded-full blur-[0.5px]" />

          {/* White inner core circle */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 flex items-center justify-center shadow-inner border border-white">
            <span
              className={`text-base sm:text-lg font-black font-mono leading-none ${
                n === 0
                  ? 'text-purple-600'
                  : n === 5
                  ? 'text-emerald-600'
                  : n % 2 === 0
                  ? 'text-rose-500'
                  : 'text-emerald-500'
              }`}
            >
              {n}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-800 pb-28 select-none relative">
      {/* Spectacular Confetti & Coins on WIN */}
      {roundResultModal?.isWin && <WinConfettiEffect />}

      {/* 1. Header with Golden Curved Background */}
      <div className="relative bg-gradient-to-b from-[#f7c02b] via-[#f7c536] to-[#f4be22] pb-6 pt-3 px-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="p-1 text-slate-800 hover:text-black active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Logo "DX WIN" */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-sm italic shadow-sm bg-white/20">
              DX
            </div>
            <span className="text-2xl font-black italic tracking-wider text-white drop-shadow-sm font-sans">
              WIN
            </span>
          </div>

          {/* Top Right Wallet & Audio Controls */}
          <div className="flex items-center gap-2 text-white">
            <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 shadow-inner">
              <Wallet className="w-3.5 h-3.5 text-slate-950" />
              <span className="font-mono">৳ {currentBalance.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-full text-white/90 hover:text-white"
              title="সাউন্ড অন/অফ"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick Nav Chips Row inside game header */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('home') : onBack())}
            className="px-2.5 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 backdrop-blur-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('deposit') : null)}
            className="px-2.5 py-1 rounded-full bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-400/50 text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
            <span>ডিপোজিট</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('records') : null)}
            className="px-2.5 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 backdrop-blur-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>হিস্ট্রি</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('profile') : null)}
            className="px-2.5 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 backdrop-blur-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>প্রোফাইল</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playWinBabaSound();
              setTimeout(() => playLossPopaSound(), 1000);
            }}
            className="px-2.5 py-1 rounded-full bg-white/40 hover:bg-white/60 text-slate-950 text-[10px] font-black flex items-center gap-1 shrink-0 shadow-xs"
            title="উইনবাবা ও লাশ পোপা সাউন্ড টেস্ট"
          >
            <Volume2 className="w-3 h-3 text-slate-950" />
            <span>সাউন্ড টেস্ট</span>
          </button>
        </div>

        {/* 2. Notice ticker bar */}
        <div className="mt-3 bg-white rounded-full px-3 py-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
            <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="overflow-hidden whitespace-nowrap text-xs text-slate-600 font-medium">
              <span className="inline-block animate-marquee">
                🎉 WinGo মেগা প্রাইজ ডাবল বোনাস চলছে! ০ ও ৫ নম্বরে পেয়ে যান ৪.৫ গুণ পর্যন্ত পুরস্কার!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="bg-[#f5c22e] hover:bg-[#eab31a] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-xs active:scale-95"
          >
            Detail
          </button>
        </div>
      </div>

      <div className="px-3.5 -mt-3 relative z-10 space-y-3">
        {/* Floating Top Notification for latest round result */}
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

          {/* Quick Win/Loss Banner if user played in last round */}
          {lastCompletedBet && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm ${
                lastCompletedBet.isWin
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {lastCompletedBet.isWin ? (
                  <Trophy className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Frown className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  সর্বশেষ রাউন্ড #{lastCompletedBet.period.slice(-4)}:{' '}
                  {lastCompletedBet.isWin ? 'অভিনন্দন! আপনি জিতেছেন' : 'দুঃখিত! লস হয়েছে'}
                </span>
              </div>
              <span
                className={`font-mono font-black text-sm ${
                  lastCompletedBet.isWin ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {lastCompletedBet.isWin
                  ? `+ ৳ ${lastCompletedBet.amount}`
                  : `- ৳ ${lastCompletedBet.amount}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Market Mode Selectors: 30s AI Market, 30s Live Market, 1 Min AI, 3 Min Live */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 grid grid-cols-4 gap-1.5">
          {[
            { id: 'ai_30s', label: '30s\nএ আই মার্কেট', icon: Cpu, badge: 'AI' },
            { id: 'live_30s', label: '30s\nলাইভ মার্কেট', icon: Radio, badge: 'LIVE' },
            { id: 'ai_1m', label: 'WinGo 1\nMin (AI)', icon: TrendingUp, badge: '1M' },
            { id: 'live_3m', label: 'WinGo 3\nMin (Live)', icon: Clock, badge: '3M' },
          ].map((mode) => {
            const isActive = timeMode === mode.id;
            const IconComp = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSelectMode(mode.id as TimeMode)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                  isActive
                    ? 'bg-[#f7c02b] text-white shadow-md font-bold'
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
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-[11px] leading-tight text-center whitespace-pre-line">
                  {mode.label}
                </span>
                <span
                  className={`text-[8px] font-black px-1.5 py-0.2 rounded-full absolute -top-1 right-1 shadow-xs ${
                    mode.badge === 'AI'
                      ? 'bg-purple-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {mode.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Market Intelligence Banner */}
        <div
          className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between shadow-xs transition-all ${
            timeMode === 'ai_30s' || timeMode === 'ai_1m'
              ? 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-purple-400/40 text-purple-950'
              : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-400/40 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {timeMode === 'ai_30s' || timeMode === 'ai_1m' ? (
              <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
            )}
            <div className="text-[11px] font-semibold leading-tight">
              {timeMode === 'ai_30s' || timeMode === 'ai_1m' ? (
                <span>
                  <strong>🤖 এ আই মার্কেট প্রেডিকশন:</strong> সবুজ ৫৪% | লাল ৪২% | বেগুনী ৪% (Big ৫৭% ট্রেন্ড)
                </span>
              ) : (
                <span>
                  <strong>⚡ লাইভ মার্কেট পালস:</strong> ১২,৪৫০ জন সক্রিয় ট্রেডার | ট্রেন্ড: বুলিশ 📈
                </span>
              )}
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white shadow-xs font-mono shrink-0 text-slate-800">
            {timeMode === 'ai_30s' || timeMode === 'ai_1m' ? 'AI সিগন্যাল' : 'LIVE'}
          </span>
        </div>

        {/* 4. Golden Status Banner with Countdown and Recent 5 Balls */}
        <div className="bg-gradient-to-r from-[#f7c02b] via-[#f7c536] to-[#f4be22] rounded-3xl p-3.5 shadow-md text-white relative overflow-hidden flex items-center justify-between">
          {/* Left section */}
          <div className="space-y-2 flex-1 pr-2">
            <button
              type="button"
              onClick={() => setShowHowToPlay(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/60 bg-white/10 text-white text-xs font-semibold backdrop-blur-xs active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to play</span>
            </button>

            <div className="text-xs font-bold text-white/90">
              WinGo{' '}
              {timeMode === 'ai_30s'
                ? '30s AI মার্কেট'
                : timeMode === 'live_30s'
                ? '30s লাইভ মার্কেট'
                : timeMode === 'ai_1m'
                ? '1 Min AI'
                : '3 Min Live'}
            </div>

            {/* Recent 5 Balls */}
            <div className="flex items-center gap-1 pt-0.5">
              {history.slice(0, 5).map((item, idx) => (
                <div key={idx} className="shrink-0">
                  {renderMiniBall(item.number, item.color)}
                </div>
              ))}
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="h-16 w-[1px] border-r-2 border-dotted border-white/40 mx-2" />

          {/* Right section: Digital Flip Countdown & Period ID */}
          <div className="flex flex-col items-end pl-2">
            <span className="text-[11px] font-bold text-white/90 mb-1">Time remaining</span>

            {/* Countdown Boxes: [0] [0] : [0] [9] */}
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

            {/* Period Number */}
            <div className="text-[11px] font-mono font-bold text-white/95 mt-2 tracking-tight">
              {currentPeriod}
            </div>
          </div>
        </div>

        {/* 4.5. PERSISTENT ACTIVE BETS BAR ("যেটাতে ধরবে সেটা থাকবে সবসময় দেখাবে বারবার চেঞ্জ হবে না") */}
        {activeRoundBets.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-amber-400/70 rounded-2xl p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-amber-950">
              <div className="flex items-center gap-1.5">
                <Pin className="w-4 h-4 text-amber-600" />
                <span>আপনার বর্তমান রাউন্ডের বেট (স্থায়ী থাকবে):</span>
              </div>
              <span className="text-[11px] font-mono font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                মোট ৳ {totalActiveBetAmount}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRoundBets.map((b, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white border border-amber-300/80 text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-700 font-black">✓ {b.selection}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-emerald-800 font-black">৳ {b.betAmount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-intrusive Round Close Indicator (No screen blur, full visibility) */}
        {isLocked && (
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-950 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>🔒 রাউন্ড ক্লোজ হচ্ছে ({timeLeft}s বাকি) — স্ক্রিন স্পষ্ট থাকবে, ফলাফল গণনা চলছে...</span>
          </div>
        )}

        <div className="relative">

          {/* 5. Color Buttons: Green, Violet, Red with Persistent Bet Indicators */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Green */}
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('color', 'green')}
              className={`py-2.5 px-1 rounded-xl bg-[#00ba66] hover:bg-[#00a65b] active:scale-95 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 relative flex flex-col items-center justify-center ${
                greenBetAmount > 0
                  ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-[#f3f4f8] shadow-md'
                  : ''
              }`}
            >
              <span>Green</span>
              {greenBetAmount > 0 && (
                <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md mt-0.5 shadow-xs">
                  ✓ ধরা: ৳{greenBetAmount}
                </span>
              )}
            </button>

            {/* Violet */}
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('color', 'violet')}
              className={`py-2.5 px-1 rounded-xl bg-[#b648ff] hover:bg-[#a631f4] active:scale-95 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 relative flex flex-col items-center justify-center ${
                violetBetAmount > 0
                  ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-[#f3f4f8] shadow-md'
                  : ''
              }`}
            >
              <span>Violet</span>
              {violetBetAmount > 0 && (
                <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md mt-0.5 shadow-xs">
                  ✓ ধরা: ৳{violetBetAmount}
                </span>
              )}
            </button>

            {/* Red */}
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('color', 'red')}
              className={`py-2.5 px-1 rounded-xl bg-[#fb5b5b] hover:bg-[#eb4a4a] active:scale-95 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 relative flex flex-col items-center justify-center ${
                redBetAmount > 0
                  ? 'ring-3 ring-amber-300 ring-offset-2 ring-offset-[#f3f4f8] shadow-md'
                  : ''
              }`}
            >
              <span>Red</span>
              {redBetAmount > 0 && (
                <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md mt-0.5 shadow-xs">
                  ✓ ধরা: ৳{redBetAmount}
                </span>
              )}
            </button>
          </div>

          {/* 6. Numbers Grid (0 to 9 in 2 rows) */}
          <div className="bg-[#f8f9fc] rounded-3xl p-3 border border-slate-200/60 shadow-sm mt-3">
            <div className="grid grid-cols-5 gap-y-3 justify-items-center">
              {[0, 1, 2, 3, 4].map((n) => renderNumberBall(n))}
              {[5, 6, 7, 8, 9].map((n) => renderNumberBall(n))}
            </div>
          </div>

          {/* 7. Multipliers Row: Random, X1, X5, X10, X20, X50, X100 */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => {
                const randomNum = Math.floor(Math.random() * 10);
                openBetModal('number', randomNum);
              }}
              className="px-3 py-1 rounded-md border border-[#fb5b5b] text-[#fb5b5b] hover:bg-rose-50 text-xs font-bold shrink-0 active:scale-95 disabled:opacity-50"
            >
              Random
            </button>

            {[1, 5, 10, 20, 50, 100].map((mul) => {
              const isSelected = selectedMultiplier === mul;
              return (
                <button
                  key={mul}
                  type="button"
                  onClick={() => handleMultiplierChange(mul)}
                  className={`px-3 py-1 rounded-md text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#00ba66] text-white shadow-xs'
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  X{mul}
                </button>
              );
            })}
          </div>

          {/* 8. Big / Small Buttons with Persistent Bet Indicators */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('size', 'Big')}
              className={`py-2.5 px-2 rounded-full bg-gradient-to-r from-[#ff9b36] to-[#f78214] text-white font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                bigBetAmount > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>Big</span>
              {bigBetAmount > 0 && (
                <span className="text-[10px] font-mono font-black bg-white text-amber-700 px-2 py-0.2 rounded-full shadow-xs">
                  ✓ ধরা: ৳{bigBetAmount}
                </span>
              )}
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => openBetModal('size', 'Small')}
              className={`py-2.5 px-2 rounded-full bg-gradient-to-r from-[#59b8ff] to-[#3a9ef0] text-white font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                smallBetAmount > 0 ? 'ring-3 ring-amber-300 ring-offset-2' : ''
              }`}
            >
              <span>Small</span>
              {smallBetAmount > 0 && (
                <span className="text-[10px] font-mono font-black bg-white text-sky-700 px-2 py-0.2 rounded-full shadow-xs">
                  ✓ ধরা: ৳{smallBetAmount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 9. History Tabs: Game history | Chart | My history */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setHistoryTab('game_history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              historyTab === 'game_history'
                ? 'bg-[#f7c02b] text-white shadow-sm'
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
                ? 'bg-[#f7c02b] text-white shadow-sm'
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
                ? 'bg-[#f7c02b] text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            My history
          </button>
        </div>

        {/* 10. Table matching screenshot */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {historyTab === 'game_history' && (
            <div>
              {/* Table Header Bar */}
              <div className="bg-[#f7c02b] text-white font-bold text-xs grid grid-cols-4 py-2.5 px-3 text-center">
                <span className="text-left pl-1">Period</span>
                <span>Number</span>
                <span>Big Small</span>
                <span>Color</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 text-xs">
                {history.map((row, idx) => {
                  const isRed = row.number % 2 === 0 && row.number !== 0;
                  const isGreen = row.number % 2 !== 0 && row.number !== 5;
                  const isRedViolet = row.number === 0;
                  const isGreenViolet = row.number === 5;

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-4 py-2.5 px-3 items-center text-center hover:bg-slate-50/70"
                    >
                      {/* Period */}
                      <span className="text-slate-600 font-mono text-[11px] text-left pl-1">
                        {row.period}
                      </span>

                      {/* Number */}
                      <span
                        className={`text-base font-black font-mono ${
                          isRed || isRedViolet ? 'text-[#fb5b5b]' : 'text-[#00ba66]'
                        }`}
                      >
                        {row.number}
                      </span>

                      {/* Big Small */}
                      <span className="text-slate-600 font-medium">{row.bigSmall}</span>

                      {/* Color Circle */}
                      <div className="flex items-center justify-center">
                        {isRedViolet ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 shadow-xs" />
                        ) : isGreenViolet ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 shadow-xs" />
                        ) : isGreen ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#00ba66] shadow-xs" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-[#fb5b5b] shadow-xs" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {historyTab === 'chart' && (
            <div className="p-4 text-center space-y-3">
              <span className="text-xs font-bold text-slate-500">
                নাম্বার ট্রেন্ড চার্ট (Trend Analysis)
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap py-2">
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    {renderMiniBall(h.number, h.color)}
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{h.period.slice(-3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY HISTORY TAB WITH PROMINENT WIN / LOSS DISPLAY */}
          {historyTab === 'my_history' && (
            <div className="p-3 text-xs">
              {myBets.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-1">
                  <p>এখনো কোনো বেট করেননি!</p>
                  <p className="text-[10px]">উপরে কালার, সংখ্যা বা Big/Small ধরে বেট প্লেস করুন।</p>
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
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase text-white ${
                                b.selection === 'green'
                                  ? 'bg-[#00ba66]'
                                  : b.selection === 'violet'
                                  ? 'bg-[#b648ff]'
                                  : b.selection === 'red'
                                  ? 'bg-[#fb5b5b]'
                                  : b.selection === 'Big'
                                  ? 'bg-amber-500'
                                  : b.selection === 'Small'
                                  ? 'bg-sky-500'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {b.selection}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              #{b.period.slice(-6)}
                            </span>
                          </div>

                          {/* Status Badge: Win / Loss / Running */}
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

                        {/* Amount breakdown */}
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

      {/* 11. Betting Sheet / Drawer Bottom Modal */}
      <AnimatePresence>
        {betModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-4 space-y-3.5 shadow-2xl text-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black text-white ${
                      activeSelection === 'green'
                        ? 'bg-[#00ba66]'
                        : activeSelection === 'violet'
                        ? 'bg-[#b648ff]'
                        : activeSelection === 'red'
                        ? 'bg-[#fb5b5b]'
                        : activeSelection === 'Big'
                        ? 'bg-amber-500'
                        : activeSelection === 'Small'
                        ? 'bg-sky-500'
                        : 'bg-emerald-600'
                    }`}
                  >
                    Select {activeSelection}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    WinGo{' '}
                    {timeMode === 'ai_30s'
                      ? '30s AI মার্কেট'
                      : timeMode === 'live_30s'
                      ? '30s লাইভ মার্কেট'
                      : timeMode === 'ai_1m'
                      ? '1 Min AI'
                      : '3 Min Live'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBetModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Balance Select */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">বেট অ্যামাউন্ট নির্ধারণ</span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBaseUnit(amt)}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                        baseUnit === amt
                          ? 'bg-[#00ba66] text-white border-[#00ba66] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {amt} ৳
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter & Multiplier */}
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
                          ? 'bg-[#00ba66] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      X{m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agree rules checkbox */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    agreeTerms
                      ? 'bg-[#00ba66] border-[#00ba66] text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span>I agree to PRE-SALE RULES</span>
              </div>

              {/* Total & Action Buttons */}
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
                  className="flex-[2] py-3 rounded-2xl bg-[#00ba66] hover:bg-[#00a65b] text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Total amount ৳ {baseUnit * quantity}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. DEDICATED WIN / LOSS RESULT MODAL ("উইন হলে প্রভাব আসবে") */}
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
              {/* Golden Radiation Glow on Win */}
              {roundResultModal.isWin && (
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-[70px] pointer-events-none" />
              )}

              {/* Top Banner Ribbon */}
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
                  {roundResultModal.isWin && <Flame className="w-5 h-5 text-amber-300 animate-pulse" />}
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

              {/* Body Content */}
              <div className="p-5 space-y-4 relative z-10">
                {/* Result Ball Display */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-300 font-bold">বিজয়ী রাউন্ড ফলাফল:</span>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {/* Big 3D ball of winning number */}
                    <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/50 flex items-center justify-center shadow-xl">
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center font-black text-2xl font-mono shadow-inner ${
                          roundResultModal.winningNum === 0
                            ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white'
                            : roundResultModal.winningNum === 5
                            ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white'
                            : roundResultModal.winningNum % 2 === 0
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {roundResultModal.winningNum}
                      </div>
                    </div>

                    <div className="text-left text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">রং:</span>
                        <span
                          className={`font-black uppercase px-2.5 py-0.5 rounded-md text-[10px] text-white shadow-xs ${
                            roundResultModal.winningColor === 'red'
                              ? 'bg-rose-600'
                              : roundResultModal.winningColor === 'green'
                              ? 'bg-emerald-600'
                              : 'bg-purple-600'
                          }`}
                        >
                          {roundResultModal.winningColor}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">সাইজ:</span>
                        <span className="font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                          {roundResultModal.winningSize}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Won or Lost Big Highlight */}
                <div
                  className={`p-4 rounded-2xl border text-center space-y-1 shadow-lg ${
                    roundResultModal.isWin
                      ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300'
                      : 'bg-rose-500/25 border-rose-500/60 text-rose-300'
                  }`}
                >
                  <span className="text-xs font-bold block uppercase tracking-wider">
                    {roundResultModal.isWin ? 'আপনার মোট লাভ (WIN AMOUNT):' : 'আপনার লস (LOST AMOUNT):'}
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                    {roundResultModal.isWin
                      ? `+ ৳ ${roundResultModal.totalWon.toFixed(2)}`
                      : `- ৳ ${roundResultModal.totalLost.toFixed(2)}`}
                  </div>
                </div>

                {/* Your Prediction Details */}
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

                {/* Balance Info */}
                <div className="text-xs text-slate-300 flex items-center justify-between px-1">
                  <span>বর্তমান একাউন্ট ব্যালেন্স:</span>
                  <span className="font-mono font-black text-emerald-300 text-sm">
                    ৳ {currentBalance.toFixed(2)}
                  </span>
                </div>

                {/* Action button */}
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

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-[#f7c02b]">📖 WinGo খেলার নিয়মাবলী</h3>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed max-h-72 overflow-y-auto">
              <p>
                <strong>১. সবুজ (Green):</strong> ১, ৩, ৭, ৯ আসলে পাবেন ২ গুণ। ৫ আসলে পাবেন ১.৫ গুণ।
              </p>
              <p>
                <strong>২. লাল (Red):</strong> ২, ৪, ৬, ৮ আসলে পাবেন ২ গুণ। ০ আসলে পাবেন ১.৫ গুণ।
              </p>
              <p>
                <strong>৩. বেগুনি (Violet):</strong> ০ অথবা ৫ আসলে পাবেন ৪.৫ গুণ।
              </p>
              <p>
                <strong>৪. সংখ্যা (0-9):</strong> যে সংখ্যাটি নির্বাচন করবেন হুবহু সেটি আসলে পাবেন{' '}
                <strong>৯ গুণ</strong>!
              </p>
              <p>
                <strong>৫. Big / Small:</strong> ৫ থেকে ৯ হলে Big এবং ০ থেকে ৪ হলে Small (২ গুণ লাভ)।
              </p>
              <p className="text-amber-600 font-semibold">⚠️ প্রতি রাউন্ডের শেষ ৫ সেকেন্ড বেট লক থাকে।</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl bg-[#f7c02b] text-white font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* In-game Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('home') : onBack())}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold">হোম</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 text-[#d69804]"
          >
            <div className="w-5 h-5 rounded-full bg-[#f7c02b] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              W
            </div>
            <span className="text-[10px] font-black text-[#b88200]">উইঙ্গো</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('game_aviator') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-rose-500 transition-colors"
          >
            <Plane className="w-4 h-4 -rotate-45" />
            <span className="text-[10px] font-bold">এভিয়েটর</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('deposit') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold">ডিপোজিট</span>
          </button>
          <button
            type="button"
            onClick={() => (onNavigate ? onNavigate('profile') : null)}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-bold">প্রোফাইল</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
