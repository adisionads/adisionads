'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Campaign,
  CampaignAssignment,
  Community,
  LedgerTransaction,
  ProofRecord,
  UserProfile,
  UserRole,
  Wallet,
  WithdrawalRequest,
} from '@/types';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_COMMUNITIES,
  INITIAL_LEDGER_TRANSACTIONS,
  INITIAL_PROOFS,
  INITIAL_USER_ADMIN,
  INITIAL_USER_ADVERTISER,
  INITIAL_USER_PARTNER,
  INITIAL_WALLET_PARTNER,
  INITIAL_WITHDRAWALS,
} from './mock-data';
import { generateTrackingCode } from '../utils';

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  communities: Community[];
  campaigns: Campaign[];
  assignments: CampaignAssignment[];
  proofs: ProofRecord[];
  wallet: Wallet;
  ledger: LedgerTransaction[];
  withdrawals: WithdrawalRequest[];
  // Actions
  addCommunity: (comm: Omit<Community, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at'>) => Community;
  verifyCommunity: (communityId: string, approved: boolean, reason?: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'advertiser_id' | 'status' | 'payment_status' | 'created_at' | 'updated_at'>) => Campaign;
  markCampaignPaid: (campaignId: string) => void;
  assignCampaignToCommunity: (campaignId: string, communityId: string, payoutAmount: number) => CampaignAssignment;
  acceptAssignment: (assignmentId: string) => void;
  submitProof: (assignmentId: string, proofImageUrl: string, notes?: string) => void;
  reviewProof: (proofId: string, approved: boolean, feedback?: string) => void;
  requestWithdrawal: (amount: number, bankName: string, accountNumber: string, accountName: string) => void;
  processWithdrawal: (withdrawalId: string, approved: boolean) => void;
  recordClick: (trackingCode: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADVERTISER');
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [assignments, setAssignments] = useState<CampaignAssignment[]>(INITIAL_ASSIGNMENTS);
  const [proofs, setProofs] = useState<ProofRecord[]>(INITIAL_PROOFS);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET_PARTNER);
  const [ledger, setLedger] = useState<LedgerTransaction[]>(INITIAL_LEDGER_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWALS);

  // Derive current user profile
  const currentUser: UserProfile =
    currentRole === 'ADVERTISER'
      ? INITIAL_USER_ADVERTISER
      : currentRole === 'COMMUNITY_PARTNER'
      ? INITIAL_USER_PARTNER
      : INITIAL_USER_ADMIN;

  const addCommunity = (commData: Omit<Community, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at'>): Community => {
    const newCommunity: Community = {
      ...commData,
      id: `comm_${Date.now()}`,
      owner_id: currentUser.id,
      status: 'SUBMITTED',
      performance_score: 85.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCommunities((prev) => [newCommunity, ...prev]);
    return newCommunity;
  };

  const verifyCommunity = (communityId: string, approved: boolean, reason?: string) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? {
              ...c,
              status: approved ? 'VERIFIED' : 'REJECTED',
              rejection_reason: reason,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  const createCampaign = (
    campData: Omit<Campaign, 'id' | 'advertiser_id' | 'status' | 'payment_status' | 'created_at' | 'updated_at'>
  ): Campaign => {
    const newCampaign: Campaign = {
      ...campData,
      id: `camp_${Date.now()}`,
      advertiser_id: currentUser.id,
      status: 'SUBMITTED',
      payment_status: 'PAID', // In demo/sandbox mode automatically active
      total_clicks: 0,
      unique_clicks: 0,
      assigned_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  };

  const markCampaignPaid = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              payment_status: 'PAID',
              status: 'ACTIVE',
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  const assignCampaignToCommunity = (
    campaignId: string,
    communityId: string,
    payoutAmount: number
  ): CampaignAssignment => {
    const trackingCode = generateTrackingCode();
    const campaign = campaigns.find((c) => c.id === campaignId);
    const community = communities.find((c) => c.id === communityId);

    const newAssignment: CampaignAssignment = {
      id: `asgn_${Date.now()}`,
      campaign_id: campaignId,
      community_id: communityId,
      assigned_by: currentUser.id,
      tracking_code: trackingCode,
      payout_amount: payoutAmount,
      status: 'ASSIGNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      campaign,
      community,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Update campaign assigned count
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, assigned_count: (c.assigned_count || 0) + 1 } : c
      )
    );

    return newAssignment;
  };

  const acceptAssignment = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? { ...a, status: 'ACCEPTED', accepted_at: new Date().toISOString() }
          : a
      )
    );
  };

  const submitProof = (assignmentId: string, proofImageUrl: string, notes?: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const newProof: ProofRecord = {
      id: `proof_${Date.now()}`,
      assignment_id: assignmentId,
      community_id: assignment.community_id,
      submitted_by: currentUser.id,
      proof_image_url: proofImageUrl,
      placement_timestamp: new Date().toISOString(),
      notes,
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      assignment,
      community: assignment.community,
    };

    setProofs((prev) => [newProof, ...prev]);

    // Update assignment status
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? { ...a, status: 'PROOF_SUBMITTED', published_at: new Date().toISOString() }
          : a
      )
    );
  };

  const reviewProof = (proofId: string, approved: boolean, feedback?: string) => {
    const proof = proofs.find((p) => p.id === proofId);
    if (!proof) return;

    setProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: approved ? 'APPROVED' : 'REJECTED',
              review_feedback: feedback,
              reviewed_at: new Date().toISOString(),
            }
          : p
      )
    );

    if (approved) {
      const assignment = assignments.find((a) => a.id === proof.assignment_id);
      const payout = assignment ? assignment.payout_amount : 4500;

      // 1. Update assignment
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === proof.assignment_id
            ? { ...a, status: 'VERIFIED', completed_at: new Date().toISOString() }
            : a
        )
      );

      // 2. Atomically update wallet
      setWallet((prev) => {
        const newAvailable = prev.available_balance + payout;
        return {
          ...prev,
          available_balance: newAvailable,
          lifetime_earned: prev.lifetime_earned + payout,
          updated_at: new Date().toISOString(),
        };
      });

      // 3. Record Ledger Transaction
      const newTx: LedgerTransaction = {
        id: `tx_${Date.now()}`,
        wallet_id: wallet.id,
        user_id: proof.submitted_by,
        transaction_type: 'CAMPAIGN_PAYOUT',
        amount: payout,
        direction: 'CREDIT',
        balance_after: wallet.available_balance + payout,
        description: `Verified placement payout for ${proof.assignment?.campaign?.title || 'Campaign'}`,
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
      };
      setLedger((prev) => [newTx, ...prev]);
    }
  };

  const requestWithdrawal = (
    amount: number,
    bankName: string,
    accountNumber: string,
    accountName: string
  ) => {
    if (amount > wallet.available_balance) {
      throw new Error('Insufficient wallet balance');
    }

    const newWithdrawal: WithdrawalRequest = {
      id: `wdr_${Date.now()}`,
      wallet_id: wallet.id,
      user_id: currentUser.id,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Deduct from available balance into pending
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance - amount,
      updated_at: new Date().toISOString(),
    }));

    // Record Ledger Entry
    const newTx: LedgerTransaction = {
      id: `tx_${Date.now()}`,
      wallet_id: wallet.id,
      user_id: currentUser.id,
      transaction_type: 'WITHDRAWAL',
      amount,
      direction: 'DEBIT',
      balance_after: wallet.available_balance - amount,
      description: `Withdrawal request to ${bankName} (${accountNumber})`,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    setLedger((prev) => [newTx, ...prev]);
  };

  const processWithdrawal = (withdrawalId: string, approved: boolean) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status: approved ? 'COMPLETED' : 'REJECTED',
              processed_at: new Date().toISOString(),
            }
          : w
      )
    );
  };

  const recordClick = (trackingCode: string) => {
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        total_clicks: (c.total_clicks || 0) + 1,
        unique_clicks: (c.unique_clicks || 0) + 1,
      }))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        communities,
        campaigns,
        assignments,
        proofs,
        wallet,
        ledger,
        withdrawals,
        addCommunity,
        verifyCommunity,
        createCampaign,
        markCampaignPaid,
        assignCampaignToCommunity,
        acceptAssignment,
        submitProof,
        reviewProof,
        requestWithdrawal,
        processWithdrawal,
        recordClick,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
