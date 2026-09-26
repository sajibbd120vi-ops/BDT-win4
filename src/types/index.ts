export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  mobile: string;
  email?: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  registrationDate: string;
  status: 'active' | 'disabled';
  avatarUrl?: string;
  role: UserRole;
}

export type DepositStatus = 'Pending' | 'Confirmed' | 'Rejected';

export interface DepositRequest {
  id: string;
  uid: string;
  userName: string;
  userMobile: string;
  amount: number;
  bonusAmount?: number;
  paymentMethod: 'bKash' | 'Nagad';
  paymentNumber: string;
  transactionId: string;
  date: string;
  status: DepositStatus;
  adminNote?: string;
  confirmedAt?: string;
}

export type WithdrawStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface WithdrawalRequest {
  id: string;
  uid: string;
  userName: string;
  userMobile: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Bank';
  accountNumber: string;
  accountHolderName: string;
  bankName?: string;
  branchName?: string;
  date: string;
  status: WithdrawStatus;
  adminNote?: string;
  processedAt?: string;
}

export interface BankAccount {
  id: string;
  uid: string;
  method: 'bKash' | 'Nagad' | 'Bank';
  accountHolderName: string;
  accountNumber: string;
  bankName?: string;
  branch?: string;
  isDefault?: boolean;
}

export type RecordType = 'deposit' | 'withdraw' | 'referral' | 'game' | 'system';

export interface TransactionRecord {
  id: string;
  uid: string;
  type: RecordType;
  title: string;
  amount: number;
  isCredit: boolean;
  date: string;
  referenceId: string;
  status: string;
  description?: string;
}

export interface ReferralMember {
  uid: string;
  name: string;
  mobile: string;
  date: string;
  level: 1 | 2 | 3;
  earnings: number;
}

export interface SupportChatMessage {
  id: string;
  uid: string;
  userName: string;
  userMobile: string;
  sender: 'user' | 'admin' | 'system';
  message: string;
  date: string;
  status: 'Pending' | 'Answered' | 'Resolved';
}

export interface GameItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  minBet?: number;
  enabled: boolean;
  order: number;
  playersCount?: number;
}

export interface DepositAmountOption {
  id: string;
  amount: number;
  label: string;
  enabled: boolean;
  order: number;
}

export interface AppSettings {
  siteName: string;
  noticeText: string;
  adminPassword?: string;
  bKashNumber: string;
  bKashEnabled: boolean;
  nagadNumber: string;
  nagadEnabled: boolean;
  minDeposit: number;
  minWithdraw: number;
  telegramGroupUrl: string;
  telegramSupportUrl: string;
  telegramEnabled: boolean;
  referralEnabled: boolean;
  level1Percent: number;
  level2Percent: number;
  level3Percent: number;
  referralSignupBonus: number;
  newUserWelcomeBonus: number;
}

export interface AdminLog {
  id: string;
  action: string;
  adminUser: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface WinColorRoundHistory {
  roundId: string;
  number: number;
  color: 'red' | 'green' | 'violet' | 'red_violet' | 'green_violet';
  size: 'big' | 'small';
}

export interface UserGameBetRecord {
  id: string;
  uid: string;
  gameCode: string;
  gameName: string;
  period: string;
  selection: string | number;
  betAmount: number;
  winAmount: number;
  status: 'Pending' | 'Won' | 'Lost';
  date: string;
  result?: string;
}
