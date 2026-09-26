import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  Headphones,
  Gamepad2,
  Share2,
  Send,
  Receipt,
  FileText,
  LogOut,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import {
  UserProfile,
  DepositRequest,
  WithdrawalRequest,
  SupportChatMessage,
  GameItem,
  DepositAmountOption,
  AppSettings,
  AdminLog,
} from '../../types';

interface AdminPortalProps {
  onClose: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'deposits'
  | 'withdrawals'
  | 'payment_settings'
  | 'deposit_amounts'
  | 'referral_settings'
  | 'support'
  | 'games'
  | 'settings'
  | 'logs';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const { adminLogout, currentUser, isAdmin, adminLogin } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stateVersion, setStateVersion] = useState(0);

  // Subscribe to live DB updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setStateVersion((v) => v + 1);
    });
    return () => unsub();
  }, []);

  const dbState = db.getState();
  const users = dbState.users;
  const deposits = dbState.deposits;
  const withdrawals = dbState.withdrawals;
  const support = dbState.supportMessages;
  const games = dbState.games;
  const amounts = dbState.depositAmounts;
  const settings = dbState.settings;
  const logs = dbState.adminLogs;

  // Overview calculations
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const pendingDeposits = deposits.filter((d) => d.status === 'Pending');
  const confirmedDeposits = deposits.filter((d) => d.status === 'Confirmed');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');
  const completedWithdrawals = withdrawals.filter((w) => w.status === 'Completed');
  const totalDepositAmount = confirmedDeposits.reduce((acc, d) => acc + d.amount, 0);
  const totalWithdrawAmount = completedWithdrawals.reduce((acc, w) => acc + w.amount, 0);
  const pendingSupport = support.filter((s) => s.status === 'Pending' && s.sender === 'user');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Rejected'>('All');
  const [withdrawFilter, setWithdrawFilter] = useState<'All' | 'Pending' | 'Approved' | 'Completed' | 'Rejected'>('All');

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState('');
  const [balanceAdjustReason, setBalanceAdjustReason] = useState('');

  // Support Reply State
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Forms
  const [editSettings, setEditSettings] = useState<AppSettings>({ ...settings });
  const [newAmountVal, setNewAmountVal] = useState('');
  const [newAmountLabel, setNewAmountLabel] = useState('');

  // Game Form & Edit States
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameCode, setNewGameCode] = useState('');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameImageUrl, setNewGameImageUrl] = useState('');
  const [newGameMinBet, setNewGameMinBet] = useState('10');
  const [newGameIcon, setNewGameIcon] = useState('Gamepad2');
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);

  // Dedicated Deposit & Withdraw Action Modals
  const [confirmDepositTarget, setConfirmDepositTarget] = useState<DepositRequest | null>(null);
  const [rejectDepositTarget, setRejectDepositTarget] = useState<DepositRequest | null>(null);
  const [depositRejectReason, setDepositRejectReason] = useState('ভুল ট্রানজেকশন আইডি (TrxID)');

  const [completeWithdrawTarget, setCompleteWithdrawTarget] = useState<WithdrawalRequest | null>(null);
  const [rejectWithdrawTarget, setRejectWithdrawTarget] = useState<WithdrawalRequest | null>(null);
  const [withdrawRejectReason, setWithdrawRejectReason] = useState('ভুল মোবাইল ব্যাংকিং নম্বর');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const executeConfirmDeposit = () => {
    if (!confirmDepositTarget) return;
    const res = db.confirmDeposit(confirmDepositTarget.id, 'Super Admin');
    setConfirmDepositTarget(null);
    setActionSuccessMsg(res.message);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const executeRejectDeposit = () => {
    if (!rejectDepositTarget) return;
    const res = db.rejectDeposit(rejectDepositTarget.id, depositRejectReason || 'ভুল তথ্য', 'Super Admin');
    setRejectDepositTarget(null);
    setActionSuccessMsg(res.message);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const executeCompleteWithdraw = () => {
    if (!completeWithdrawTarget) return;
    const res = db.updateWithdrawalStatus(completeWithdrawTarget.id, 'Completed', 'টাকা সফলভাবে পাঠানো হয়েছে', 'Super Admin');
    setCompleteWithdrawTarget(null);
    setActionSuccessMsg(res.message);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const executeRejectWithdraw = () => {
    if (!rejectWithdrawTarget) return;
    const res = db.updateWithdrawalStatus(rejectWithdrawTarget.id, 'Rejected', withdrawRejectReason || 'বাতিল করা হয়েছে', 'Super Admin');
    setRejectWithdrawTarget(null);
    setActionSuccessMsg(res.message);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !balanceAdjustAmount) return;
    const delta = parseFloat(balanceAdjustAmount);
    if (isNaN(delta)) return;

    db.adjustUserBalance(selectedUser.uid, delta, balanceAdjustReason || 'অ্যাডমিন অ্যাডজাস্টমেন্ট', 'Super Admin');
    setSelectedUser(null);
    setBalanceAdjustAmount('');
    setBalanceAdjustReason('');
    alert('ব্যালেন্স আপডেট সম্পন্ন হয়েছে!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(editSettings, 'Super Admin');
    alert('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleSendSupportReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessageId || !replyText.trim()) return;
    db.replySupportMessage(replyMessageId, replyText, 'Super Admin');
    setReplyMessageId(null);
    setReplyText('');
    alert('রিপ্লাই পাঠানো হয়েছে!');
  };

  const handleAddAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmountVal);
    if (isNaN(val) || val <= 0) return;
    db.addDepositAmount(val, newAmountLabel || `${val} ৳`);
    setNewAmountVal('');
    setNewAmountLabel('');
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim() || !newGameCode.trim()) return;
    db.addGame({
      name: newGameName.trim(),
      code: newGameCode.trim().toLowerCase().replace(/\s+/g, '_'),
      description: newGameDesc.trim(),
      imageUrl: newGameImageUrl.trim() || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
      minBet: parseFloat(newGameMinBet) || 10,
      icon: newGameIcon,
      enabled: true,
      order: games.length + 1,
      playersCount: 100,
    });
    setIsAddingGame(false);
    setNewGameName('');
    setNewGameCode('');
    setNewGameDesc('');
    setNewGameImageUrl('');
    setNewGameMinBet('10');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isNew) {
        setNewGameImageUrl(base64);
      } else if (editingGame) {
        setEditingGame({ ...editingGame, imageUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050b17] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-base font-black text-white">BD TAKA অ্যাডমিন পোর্টাল</h2>
            <p className="text-xs text-slate-400">
              অ্যাডমিন প্যানেলে প্রবেশ করতে সিকিউরিটি পিন দিন
            </p>
          </div>

          {pinError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{pinError}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPinError('');
              const res = await adminLogin(pinInput.trim());
              if (!res.success) {
                setPinError(res.message || 'ভুল অ্যাডমিন পিন!');
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                অ্যাডমিন পাসওয়ার্ড
              </label>
              <input
                type="password"
                placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন (যেমন: Sajib)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              প্রবেশ করুন
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              বাতিল ও ইউজার অ্যাপে ফিরুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050b17] text-white flex flex-col overflow-hidden">
      {/* Admin Top Header */}
      <header className="bg-[#091326] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white">BD TAKA CONTROL PANEL</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400">রিয়েলটাইম সেন্ট্রাল ম্যানেজমেন্ট ও ডাটাবেজ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStateVersion((v) => v + 1)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            title="রিফ্রেশ"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={adminLogout}
            className="px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/20"
          >
            লগআউট
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            title="ইউজার অ্যাপে ফিরুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Navigation Pills */}
      <div className="bg-[#081021] border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: TrendingUp, count: 0 },
          { id: 'users', label: 'ইউজার্স', icon: Users, count: totalUsers },
          { id: 'deposits', label: 'ডিপোজিট', icon: ArrowDownLeft, count: pendingDeposits.length },
          { id: 'withdrawals', label: 'উইথড্র', icon: ArrowUpRight, count: pendingWithdrawals.length },
          { id: 'payment_settings', label: 'পেমেন্ট নম্বর', icon: CreditCard, count: 0 },
          { id: 'deposit_amounts', label: 'ডিপোজিট অ্যামাউন্ট', icon: DollarSign, count: 0 },
          { id: 'referral_settings', label: 'রেফার সেটিংস', icon: Share2, count: 0 },
          { id: 'support', label: 'হেল্পডেস্ক', icon: Headphones, count: pendingSupport.length },
          { id: 'games', label: 'গেমস', icon: Gamepad2, count: games.length },
          { id: 'settings', label: 'অ্যাপ সেটিংস', icon: Settings, count: 0 },
          { id: 'logs', label: 'অডিট লগ', icon: FileText, count: 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Admin Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full space-y-4">
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">মোট ইউজার</span>
                <div className="text-xl font-black text-white font-mono">{totalUsers}</div>
                <span className="text-[10px] text-emerald-400 font-mono">সক্রিয়: {activeUsers}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">পেন্ডিং ডিপোজিট</span>
                <div className="text-xl font-black text-amber-400 font-mono">{pendingDeposits.length}</div>
                <span className="text-[10px] text-slate-400 font-mono">নিশ্চিত: {confirmedDeposits.length}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-rose-400 font-bold uppercase">পেন্ডিং উইথড্র</span>
                <div className="text-xl font-black text-rose-400 font-mono">{pendingWithdrawals.length}</div>
                <span className="text-[10px] text-slate-400 font-mono">সম্পন্ন: {completedWithdrawals.length}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">সাপোর্ট রিকোয়েস্ট</span>
                <div className="text-xl font-black text-cyan-400 font-mono">{pendingSupport.length}</div>
                <span className="text-[10px] text-slate-400 font-mono">মোট মেসেজ: {support.length}</span>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold">মোট নিশ্চিত ডিপোজিট</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ৳ {totalDepositAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">সকল সফল ক্যাশ-ইন ভলিউম</span>
                </div>
                <ArrowDownLeft className="w-10 h-10 text-emerald-500/40" />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold">মোট অনুমোদিত উইথড্র</span>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                    ৳ {totalWithdrawAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">সকল সফল পেইড উইথড্র ভলিউম</span>
                </div>
                <ArrowUpRight className="w-10 h-10 text-rose-500/40" />
              </div>
            </div>

            {/* Quick Pending Action Queues */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>জরুরী অপেক্ষমান ডিপোজিট আবেদনসমূহ ({pendingDeposits.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('deposits')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  সব দেখুন
                </button>
              </div>

              {pendingDeposits.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">কোনো অপেক্ষমান ডিপোজিট নেই।</p>
              ) : (
                <div className="space-y-2">
                  {pendingDeposits.slice(0, 3).map((dep) => (
                    <div
                      key={dep.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {dep.userName} ({dep.paymentMethod} - ৳ {dep.amount})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          TrxID: <span className="text-amber-400 font-bold">{dep.transactionId}</span> • {dep.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDepositTarget(dep)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectDepositTarget(dep);
                            setDepositRejectReason('ভুল ট্রানজেকশন আইডি (TrxID)');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[11px]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                ইউজার তালিকা ({users.length})
              </h2>
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="নাম বা মোবাইল দিয়ে সার্চ..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[65vh] overflow-y-auto">
              {users
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.mobile.includes(userSearch) ||
                    u.uid.toLowerCase().includes(userSearch.toLowerCase()),
                )
                .map((u) => (
                  <div
                    key={u.uid}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 space-x-2">
                        <span>মোবাইল: {u.mobile}</span>
                        <span>UID: {u.uid}</span>
                        <span>রেফারেল: {u.referralCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        নিবন্ধন: {u.registrationDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 block">ব্যালেন্স</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          ৳ {u.balance.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                      >
                        ব্যালেন্স সমন্বয়
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          db.setUserStatus(
                            u.uid,
                            u.status === 'active' ? 'disabled' : 'active',
                            'Super Admin',
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                          u.status === 'active'
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. DEPOSIT MANAGEMENT */}
        {activeTab === 'deposits' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                ডিপোজিট রিকোয়েস্টসমূহ ({deposits.length})
              </h2>
              <div className="flex items-center gap-1">
                {(['All', 'Pending', 'Confirmed', 'Rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDepositFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      depositFilter === filter
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto">
              {deposits
                .filter((d) => (depositFilter === 'All' ? true : d.status === depositFilter))
                .map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{dep.userName}</span>
                        <span className="font-mono text-slate-400">({dep.userMobile})</span>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                            dep.status === 'Confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : dep.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {dep.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono flex items-center gap-3">
                        <span>
                          মেথড: <strong className="text-white">{dep.paymentMethod}</strong>
                        </span>
                        <span>
                          টাকা:{' '}
                          <strong className="text-emerald-400 font-black">৳ {dep.amount}</strong>
                        </span>
                        <span>
                          নম্বর: <strong className="text-slate-300">{dep.paymentNumber}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-400 font-bold">
                        TrxID: {dep.transactionId}
                      </div>
                      <div className="text-[10px] text-slate-500">তারিখ: {dep.date}</div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {dep.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmDepositTarget(dep)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95"
                          >
                            CONFIRM
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectDepositTarget(dep);
                              setDepositRejectReason('ভুল ট্রানজেকশন আইডি (TrxID)');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold active:scale-95"
                          >
                            REJECT
                          </button>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 italic block">
                            প্রক্রিয়া সম্পন্ন ({dep.status})
                          </span>
                          {dep.adminNote && (
                            <span className="text-[10px] text-rose-400 block max-w-xs truncate">
                              কারণ: {dep.adminNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 4. WITHDRAWAL MANAGEMENT */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                উইথড্র রিকোয়েস্টসমূহ ({withdrawals.length})
              </h2>
              <div className="flex items-center gap-1">
                {(['All', 'Pending', 'Approved', 'Completed', 'Rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setWithdrawFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      withdrawFilter === filter
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto">
              {withdrawals
                .filter((w) => (withdrawFilter === 'All' ? true : w.status === withdrawFilter))
                .map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{w.userName}</span>
                        <span className="font-mono text-slate-400">({w.userMobile})</span>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                            w.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : w.status === 'Approved'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : w.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono flex items-center gap-3">
                        <span>
                          মেথড: <strong className="text-white">{w.method}</strong>
                        </span>
                        <span>
                          টাকা: <strong className="text-rose-400 font-black">৳ {w.amount}</strong>
                        </span>
                        <span>
                          প্রাপক হিসাব: <strong className="text-slate-200">{w.accountNumber}</strong>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        হিসাবধারী: {w.accountHolderName} • আবেদন: {w.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {w.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCompleteWithdrawTarget(w)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95"
                          >
                            COMPLETE
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectWithdrawTarget(w);
                              setWithdrawRejectReason('ভুল মোবাইল ব্যাংকিং নম্বর');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold active:scale-95"
                          >
                            REJECT & REFUND
                          </button>
                        </>
                      )}
                      {w.status === 'Completed' && (
                        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          ✓ পরিশোধিত
                        </span>
                      )}
                      {w.status === 'Rejected' && (
                        <div className="text-right">
                          <span className="text-[11px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 block">
                            ✕ বাতিল
                          </span>
                          {w.adminNote && (
                            <span className="text-[10px] text-rose-400/80 block max-w-xs truncate mt-0.5">
                              কারণ: {w.adminNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 5. PAYMENT SETTINGS */}
        {activeTab === 'payment_settings' && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg mx-auto">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>বিকাশ ও নগদ পেমেন্ট গেটওয়ে সেটিংস</span>
            </h2>
            <p className="text-xs text-slate-400">
              এখানে নম্বর পরিবর্তন করলে তাৎক্ষণিকভাবে সকল ব্যবহারকারীর ডিপোজিট পেইজে আপডেট হয়ে যাবে।
            </p>

            <div className="space-y-4 pt-2">
              {/* bKash Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#e2136e]">বিকাশ (bKash) সেটিংস</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSettings.bKashEnabled}
                      onChange={(e) =>
                        setEditSettings({ ...editSettings, bKashEnabled: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>সক্রিয় রাখুন</span>
                  </label>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    বিকাশ ক্যাশ-ইন নম্বর
                  </label>
                  <input
                    type="text"
                    value={editSettings.bKashNumber}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, bKashNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Nagad Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f7941d]">নগদ (Nagad) সেটিংস</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSettings.nagadEnabled}
                      onChange={(e) =>
                        setEditSettings({ ...editSettings, nagadEnabled: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>সক্রিয় রাখুন</span>
                  </label>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    নগদ ক্যাশ-ইন নম্বর
                  </label>
                  <input
                    type="text"
                    value={editSettings.nagadNumber}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, nagadNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  db.updateSettings(
                    {
                      bKashNumber: editSettings.bKashNumber,
                      bKashEnabled: editSettings.bKashEnabled,
                      nagadNumber: editSettings.nagadNumber,
                      nagadEnabled: editSettings.nagadEnabled,
                    },
                    'Super Admin',
                  );
                  alert('পেমেন্ট নম্বর সফলভাবে আপডেট হয়েছে!');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                পেমেন্ট নম্বর আপডেট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        )}

        {/* 6. DEPOSIT AMOUNT SETTINGS */}
        {activeTab === 'deposit_amounts' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>নতুন ডিপোজিট বাটন যোগ করুন</span>
              </h3>
              <form onSubmit={handleAddAmount} className="flex gap-2">
                <input
                  type="number"
                  placeholder="পরিমাণ (যেমন: ৫০০)"
                  value={newAmountVal}
                  onChange={(e) => setNewAmountVal(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="লেবেল (যেমন: ৫০০ ৳)"
                  value={newAmountLabel}
                  onChange={(e) => setNewAmountLabel(e.target.value)}
                  className="w-32 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  যোগ করুন
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400">
                বর্তমান ডিপোজিট অ্যামাউন্ট তালিকা ({amounts.length})
              </h3>
              {amounts.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ৳ {item.amount}
                    </span>
                    <span className="text-slate-400">({item.label})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        db.updateDepositAmount(item.id, { enabled: !item.enabled })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.enabled
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => db.deleteDepositAmount(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. REFERRAL SETTINGS */}
        {activeTab === 'referral_settings' && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg mx-auto">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>৩-লেভেল রেফারেল কমিশন সেটিংস</span>
            </h2>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSettings.referralEnabled}
                  onChange={(e) =>
                    setEditSettings({ ...editSettings, referralEnabled: e.target.checked })
                  }
                  className="rounded accent-emerald-500"
                />
                <span className="font-bold">রেফারেল সিস্টেম চালু রাখুন</span>
              </label>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  লেভেল ১ কমিশন শতকরা (%)
                </label>
                <input
                  type="number"
                  value={editSettings.level1Percent}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      level1Percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  লেভেল ২ কমিশন শতকরা (%)
                </label>
                <input
                  type="number"
                  value={editSettings.level2Percent}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      level2Percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  লেভেল ৩ কমিশন শতকরা (%)
                </label>
                <input
                  type="number"
                  value={editSettings.level3Percent}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      level3Percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  রেফারার সাইনআপ ফিক্সড বোনাস (৳)
                </label>
                <input
                  type="number"
                  value={editSettings.referralSignupBonus}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      referralSignupBonus: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  db.updateSettings(
                    {
                      referralEnabled: editSettings.referralEnabled,
                      level1Percent: editSettings.level1Percent,
                      level2Percent: editSettings.level2Percent,
                      level3Percent: editSettings.level3Percent,
                      referralSignupBonus: editSettings.referralSignupBonus,
                    },
                    'Super Admin',
                  );
                  alert('রেফারেল সেটিংস সংরক্ষিত হয়েছে!');
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
              >
                রেফারেল সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </div>
        )}

        {/* 8. SUPPORT / HELPDESK */}
        {activeTab === 'support' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              ইউজার সাপোর্ট মেসেজসমূহ ({support.length})
            </h2>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto">
              {support.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{msg.userName}</span>
                      {msg.userMobile && (
                        <span className="text-slate-400 font-mono">({msg.userMobile})</span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                          msg.sender === 'user'
                            ? 'bg-blue-500/20 text-blue-400'
                            : msg.sender === 'admin'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {msg.sender.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                  </div>

                  <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">স্ট্যাটাস: {msg.status}</span>
                    <div className="flex items-center gap-2">
                      {msg.sender === 'user' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyMessageId(msg.id);
                            setReplyText('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                          রিপ্লাই দিন
                        </button>
                      )}
                      {msg.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => db.resolveSupportMessage(msg.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Modal */}
            {replyMessageId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
                <form
                  onSubmit={handleSendSupportReply}
                  className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white">অ্যাডমিন রিপ্লাই পাঠান</h3>
                    <button
                      type="button"
                      onClick={() => setReplyMessageId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="আপনার উত্তর এখানে লিখুন..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    রিপ্লাই সেন্ড করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 9. GAME MANAGEMENT */}
        {activeTab === 'games' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                গেমস তালিকা ও পরিচালনা ({games.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingGame(!isAddingGame)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন গেম যোগ</span>
              </button>
            </div>

            {isAddingGame && (
              <form
                onSubmit={handleAddGame}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 max-w-lg"
              >
                <h3 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>নতুন গেম তথ্য ও ছবি যোগ</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingGame(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="গেমের নাম (যেমন: Crash Rocket)"
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="গেম কোড (যেমন: crash_rocket)"
                    value={newGameCode}
                    onChange={(e) => setNewGameCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    required
                  />
                </div>

                {/* Game Image URL & File Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-300 font-semibold block">
                      গেমের ছবি / ব্যানার
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      <Upload className="w-3 h-3" />
                      <span>গ্যালারি থেকে ছবি আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="অথবা ছবির URL দিন (https://...)"
                    value={newGameImageUrl}
                    onChange={(e) => setNewGameImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  {newGameImageUrl && (
                    <div className="mt-1 h-20 w-32 rounded-xl overflow-hidden border border-slate-700">
                      <img
                        src={newGameImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-0.5">
                      সর্বনিম্ন বেট (টাকা)
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newGameMinBet}
                      onChange={(e) => setNewGameMinBet(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-0.5">
                      আইকন
                    </label>
                    <select
                      value={newGameIcon}
                      onChange={(e) => setNewGameIcon(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Gamepad2">Gamepad</option>
                      <option value="Palette">Palette</option>
                      <option value="Hash">Numbers</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="Dice5">Dice</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  value={newGameDesc}
                  onChange={(e) => setNewGameDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  rows={2}
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Game Thumbnail Image */}
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={game.name}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-400 text-xs font-bold">
                          NO IMG
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate">{game.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({game.code})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          মিনিমাম: {game.minBet || 10} ৳
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          অর্ডার: #{game.order}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setEditingGame({ ...game })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-emerald-400" />
                      <span>ছবি ও তথ্য এডিট</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          db.updateGame(game.id, { enabled: !game.enabled })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          game.enabled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {game.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`আপনি কি "${game.name}" গেমটি মুছে ফেলতে চান?`)) {
                            db.deleteGame(game.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Game Modal */}
            {editingGame && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingGame) return;
                    db.updateGame(editingGame.id, editingGame);
                    setEditingGame(null);
                    alert('গেমের ছবি ও তথ্য সফলভাবে আপডেট হয়েছে!');
                  }}
                  className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4 text-emerald-400" />
                      <span>গেম এডিট ও ছবি পরিবর্তন: {editingGame.name}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingGame(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">গেমের নাম</label>
                    <input
                      type="text"
                      value={editingGame.name}
                      onChange={(e) => setEditingGame({ ...editingGame, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  {/* Game Image URL Input, File Upload & Presets */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-300 block font-semibold">
                        গেমের ছবি / কভার ব্যানার
                      </label>
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        <Upload className="w-3 h-3" />
                        <span>গ্যালারি থেকে ছবি আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="অথবা ছবির URL দিন (https://...)"
                      value={editingGame.imageUrl || ''}
                      onChange={(e) => setEditingGame({ ...editingGame, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1">
                        দ্রুত ছবি সিলেক্ট করুন (Presets):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Casino Roulette', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80' },
                          { label: 'Neon Numbers', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
                          { label: 'Gold Spin', url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=600&q=80' },
                          { label: 'Red Dice', url: 'https://images.unsplash.com/photo-1522069213448-443a6ec4bb4c?auto=format&fit=crop&w=600&q=80' },
                          { label: 'Slot Machine', url: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setEditingGame({ ...editingGame, imageUrl: preset.url })}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[10px] border border-slate-700"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview */}
                    {editingGame.imageUrl && (
                      <div className="mt-2 relative w-full h-28 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-inner">
                        <img
                          src={editingGame.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                          <span className="text-white text-xs font-bold">লাইভ প্রিভিউ: {editingGame.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">
                        সর্বনিম্ন বেট (টাকা)
                      </label>
                      <input
                        type="number"
                        value={editingGame.minBet || 10}
                        onChange={(e) =>
                          setEditingGame({ ...editingGame, minBet: parseFloat(e.target.value) || 10 })
                        }
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">অবস্থা (Status)</label>
                      <select
                        value={editingGame.enabled ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditingGame({ ...editingGame, enabled: e.target.value === 'true' })
                        }
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="true">Enabled (চালু)</option>
                        <option value="false">Disabled (বন্ধ)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">বিবরণ</label>
                    <textarea
                      rows={2}
                      value={editingGame.description}
                      onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingGame(null)}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                    >
                      পরিবর্তন সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 10. APP SETTINGS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg mx-auto"
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>সেন্ট্রাল অ্যাপ্লিকেশান সেটিংস</span>
            </h2>

            <div>
              <label className="text-xs text-slate-300 block mb-1">সাইটের নাম</label>
              <input
                type="text"
                value={editSettings.siteName}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, siteName: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                হোম নোটিশ / এনাউন্সমেন্ট টেক্সট
              </label>
              <textarea
                rows={2}
                value={editSettings.noticeText}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, noticeText: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">সর্বনিম্ন ডিপোজিট (৳)</label>
                <input
                  type="number"
                  value={editSettings.minDeposit}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      minDeposit: parseFloat(e.target.value) || 10,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">সর্বনিম্ন উইথড্র (৳)</label>
                <input
                  type="number"
                  value={editSettings.minWithdraw}
                  onChange={(e) =>
                    setEditSettings({
                      ...editSettings,
                      minWithdraw: parseFloat(e.target.value) || 100,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">টেলিগ্রাম চ্যানেল লিঙ্ক</label>
              <input
                type="text"
                value={editSettings.telegramGroupUrl}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, telegramGroupUrl: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-amber-300 font-bold block mb-1">
                🔐 গোপন অ্যাডমিন পাসওয়ার্ড (Admin Password)
              </label>
              <input
                type="text"
                value={editSettings.adminPassword || 'Sajib'}
                onChange={(e) =>
                  setEditSettings({ ...editSettings, adminPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-amber-300 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                এই পাসওয়ার্ডটি দিয়ে অ্যাপের "BD TAKA" লোগোতে ক্লিক করে গোপন অ্যাডমিন প্যানেলে প্রবেশ করা যাবে।
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              সকল সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        )}

        {/* 11. AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              সিস্টেম অডিট লগ ({logs.length})
            </h2>

            <div className="space-y-2 max-h-[65vh] overflow-y-auto font-mono text-[11px]">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="text-amber-400 font-bold">[{log.action}]</span>{' '}
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Balance Adjust Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <form
            onSubmit={handleAdjustBalance}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white">
                {selectedUser.name}-এর ব্যালেন্স পরিবর্তন
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 text-xs">
              <span className="text-slate-400">বর্তমান ব্যালেন্স: </span>
              <span className="text-emerald-400 font-bold font-mono">
                ৳ {selectedUser.balance.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                টাকা যোগ বা কর্তন (যেমন: +100 বা -50)
              </label>
              <input
                type="number"
                placeholder="100"
                value={balanceAdjustAmount}
                onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">কারণ</label>
              <input
                type="text"
                placeholder="ম্যানুয়াল রিচার্জ / বোনাস"
                value={balanceAdjustReason}
                onChange={(e) => setBalanceAdjustReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              ব্যালেন্স আপডেট করুন
            </button>
          </form>
        </div>
      )}

      {/* CONFIRM DEPOSIT MODAL */}
      {confirmDepositTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">ডিপোজিট কনফার্ম ও ব্যালেন্স যোগ</h3>
                <span className="text-[11px] text-slate-400">অ্যাকাউন্টে সরাসরি টাকা যুক্ত হবে</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">ইউজার:</span>
                <span className="text-white font-bold">{confirmDepositTarget.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মোবাইল:</span>
                <span className="text-white">{confirmDepositTarget.userMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">টাকা:</span>
                <span className="text-emerald-400 font-black text-sm">৳ {confirmDepositTarget.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মেথড:</span>
                <span className="text-white font-bold">{confirmDepositTarget.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TrxID:</span>
                <span className="text-amber-400 font-bold">{confirmDepositTarget.transactionId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDepositTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={executeConfirmDeposit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                হ্যাঁ, কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT DEPOSIT MODAL WITH REASON */}
      {rejectDepositTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">ডিপোজিট বাতিল (Reject Deposit)</h3>
                <span className="text-[11px] text-slate-400">ইউজারের প্যানেলে এই কারণটি দেখাবে</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">ইউজার:</span>
                <span className="text-white font-bold">{rejectDepositTarget.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">টাকা:</span>
                <span className="text-white font-mono">৳ {rejectDepositTarget.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TrxID:</span>
                <span className="text-amber-400 font-mono font-bold">{rejectDepositTarget.transactionId}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                বাতিলের কারণ সিলেক্ট করুন বা লিখুন:
              </label>

              {/* Preset reason chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ভুল ট্রানজেকশন আইডি (TrxID)',
                  'অ্যাকাউন্টে কোনো টাকা জমা আসেনি',
                  'টাকার পরিমাণ মেলেনি',
                  'ভুল ডিপোজিট নম্বর',
                  'ফেক বা ডুপ্লিকেট রিকোয়েস্ট',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setDepositRejectReason(reason)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      depositRejectReason === reason
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={depositRejectReason}
                onChange={(e) => setDepositRejectReason(e.target.value)}
                placeholder="বাতিল করার সুনির্দিষ্ট কারণ লিখুন..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectDepositTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={executeRejectDeposit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30"
              >
                রিজেক্ট নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE WITHDRAW MODAL */}
      {completeWithdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">উইথড্র পেমেন্ট সম্পন্ন</h3>
                <span className="text-[11px] text-slate-400">টাকা পাঠানো সম্পন্ন হিসেবে রেকর্ড হবে</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">ইউজার:</span>
                <span className="text-white font-bold">{completeWithdrawTarget.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মেথড:</span>
                <span className="text-white font-bold">{completeWithdrawTarget.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">প্রাপক নম্বর:</span>
                <span className="text-emerald-400 font-bold">{completeWithdrawTarget.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">পরিশোধের পরিমাণ:</span>
                <span className="text-rose-400 font-black text-sm">৳ {completeWithdrawTarget.amount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCompleteWithdrawTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={executeCompleteWithdraw}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                হ্যাঁ, পেমেন্ট সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT WITHDRAW MODAL WITH REASON */}
      {rejectWithdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">উইথড্র বাতিল ও রিফান্ড</h3>
                <span className="text-[11px] text-slate-400">টাকা স্বয়ংক্রিয়ভাবে ইউজারের ব্যালেন্সে ফেরত যাবে</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">ইউজার:</span>
                <span className="text-white font-bold">{rejectWithdrawTarget.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">টাকা:</span>
                <span className="text-white font-mono">৳ {rejectWithdrawTarget.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">নম্বর:</span>
                <span className="text-slate-300 font-mono">{rejectWithdrawTarget.accountNumber}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                বাতিলের কারণ সিলেক্ট করুন বা লিখুন:
              </label>

              {/* Preset reason chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ভুল মোবাইল ব্যাংকিং নম্বর',
                  'বিকাশ/নগদ অ্যাকাউন্টে লিমিট শেষ',
                  'উইথড্র শর্ত পূরণ হয়নি',
                  'ব্যালেন্স অমিল বা একাউন্টে ত্রুটি',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setWithdrawRejectReason(reason)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      withdrawRejectReason === reason
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={withdrawRejectReason}
                onChange={(e) => setWithdrawRejectReason(e.target.value)}
                placeholder="বাতিল করার সুনির্দিষ্ট কারণ লিখুন..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectWithdrawTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={executeRejectWithdraw}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30"
              >
                বাতিল ও রিফান্ড করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Success Toast */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-[70] px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}
    </div>
  );
};
