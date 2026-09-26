import React, { useState } from 'react';
import {
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Gamepad2,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbStore';
import { DepositRequest, WithdrawalRequest, TransactionRecord } from '../../types';

type RecordTab = 'all' | 'deposits' | 'withdrawals' | 'referrals' | 'games';

export const RecordsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<RecordTab>('all');

  const uid = currentUser ? currentUser.uid : '';

  const deposits = db.getUserDeposits(uid);
  const withdrawals = db.getUserWithdrawals(uid);
  const transactions = db.getUserTransactions(uid);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'rejected':
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-white pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#091226]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-center">
        <h1 className="text-sm font-bold tracking-wide text-white flex items-center justify-center gap-1.5">
          <ReceiptText className="w-4 h-4 text-emerald-400" />
          <span>লেনদেনের ইতিহাস ও রেকর্ড</span>
        </h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'সব লেনদেন' },
            { id: 'deposits', label: 'ডিপোজিট' },
            { id: 'withdrawals', label: 'উইথড্র' },
            { id: 'referrals', label: 'রেফার বোনাস' },
            { id: 'games', label: 'গেম হিস্ট্রি' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as RecordTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          {/* DEPOSIT TAB */}
          {activeTab === 'deposits' && (
            <div className="space-y-2.5">
              {deposits.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                  কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{dep.paymentMethod} ডিপোজিট</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{dep.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{dep.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 font-mono block">
                          + ৳ {dep.amount}
                        </span>
                        {getStatusBadge(dep.status)}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
                      <div>
                        <span>নম্বর: </span>
                        <span className="text-slate-200">{dep.paymentNumber}</span>
                      </div>
                      <div>
                        <span>TrxID: </span>
                        <span className="text-amber-400 font-bold">{dep.transactionId}</span>
                      </div>
                    </div>

                    {/* Show Rejection Reason if Rejected */}
                    {dep.status === 'Rejected' && (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-200 block">বাতিল করার কারণ:</span>
                          <span>{dep.adminNote || 'তথ্য সঠিক নয় বা ট্রানজেকশন মেলেনি।'}</span>
                        </div>
                      </div>
                    )}

                    {/* Show Confirmation Note if Confirmed */}
                    {dep.status === 'Confirmed' && (
                      <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>সফলভাবে অনুমোদিত ও ব্যালেন্সে টাকা যুক্ত হয়েছে।</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* WITHDRAW TAB */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-2.5">
              {withdrawals.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                  কোনো উইথড্র রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{w.method} উইথড্র</span>
                            <span className="text-[10px] text-slate-400 font-mono">#{w.id}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{w.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-rose-400 font-mono block">
                          - ৳ {w.amount}
                        </span>
                        {getStatusBadge(w.status)}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
                      <div>
                        <span>প্রাপক: </span>
                        <span className="text-slate-200">{w.accountHolderName}</span>
                      </div>
                      <div>
                        <span>অ্যাকাউন্ট: </span>
                        <span className="text-slate-200">{w.accountNumber}</span>
                      </div>
                    </div>

                    {/* Show Rejection Reason if Rejected */}
                    {w.status === 'Rejected' && (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-200 block">বাতিল করার কারণ:</span>
                          <span>{w.adminNote || 'মোবাইল নম্বর ভুল বা শর্ত অপূর্ণ। ব্যালেন্স ফেরত দেওয়া হয়েছে।'}</span>
                        </div>
                      </div>
                    )}

                    {/* Show Completion Note if Completed */}
                    {w.status === 'Completed' && (
                      <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>টাকা সফলভাবে আপনার অ্যাকাউন্টে পাঠিয়ে দেওয়া হয়েছে।</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ALL / GENERAL TRANSACTIONS TAB */}
          {(activeTab === 'all' || activeTab === 'referrals' || activeTab === 'games') && (
            <div className="space-y-2.5">
              {transactions
                .filter((t) => {
                  if (activeTab === 'referrals') return t.type === 'referral';
                  if (activeTab === 'games') return t.type === 'game';
                  return true;
                })
                .map((trx) => (
                  <div
                    key={trx.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          trx.type === 'deposit'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : trx.type === 'withdraw'
                            ? 'bg-rose-500/20 text-rose-400'
                            : trx.type === 'referral'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {trx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : trx.type === 'withdraw' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : trx.type === 'referral' ? (
                          <Share2 className="w-4 h-4" />
                        ) : (
                          <Gamepad2 className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">{trx.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {trx.date} • {trx.description || trx.referenceId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black font-mono block ${
                          trx.isCredit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {trx.isCredit ? '+' : '-'} ৳ {trx.amount}
                      </span>
                      {getStatusBadge(trx.status)}
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
