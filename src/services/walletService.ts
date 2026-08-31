import { supabase } from '../lib/supabase';
import { WalletTransaction } from '../types/database';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposit: number;
  total_withdraw: number;
  total_investment: number;
  total_earnings: number;
}

export const walletService = {
  async getWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Auto-create wallet if missing
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert([{ user_id: userId, balance: 0 }])
        .select()
        .single();

      if (createError) throw createError;
      return newWallet;
    }

    return data;
  },

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Razorpay Order Creation via Edge Function
   */
  async createRazorpayOrder(amount: number) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ amount })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Order creation failed');
    return result;
  },

  /**
   * Razorpay Payment Verification via Edge Function
   */
  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Verification failed');
    return result;
  }
};
