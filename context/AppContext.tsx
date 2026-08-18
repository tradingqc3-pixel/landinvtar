import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Linking, AppState, Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { finalizeSupabaseAuthFromUrl, supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/api-utils';
import { Profile } from '@/types/database';
import { storage } from '@/lib/storage';

interface AppContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLocked: boolean;
  privacyMode: boolean;
  favorites: string[];
  settings: { maintenance_mode: boolean; maintenance_message: string } | null;
  unlockApp: () => Promise<boolean>;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
  setWalletBalance: (balance: number) => void;
  setPrivacyMode: (enabled: boolean) => void;
  refreshFavorites: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isLocked: false,
  privacyMode: false,
  favorites: [],
  unlockApp: async () => false,
  refreshProfile: async () => null,
  signOut: async () => {},
  setWalletBalance: () => {},
  setPrivacyMode: () => {},
  refreshFavorites: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<{ maintenance_mode: boolean; maintenance_message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [privacyMode, setPrivacyModeState] = useState(false);
  const initialized = useRef(false);
  const isMounted = useRef(true);

  // Helper to safely update state only if component is mounted
  const safeUpdate = useCallback((updater: () => void) => {
    if (isMounted.current) {
      updater();
    }
  }, []);

  const setPrivacyMode = useCallback(async (enabled: boolean) => {
    setPrivacyModeState(enabled);
    await storage.setItem('privacy_mode', enabled ? 'true' : 'false');
  }, []);

  const fetchProfile = useCallback(async (userId: string, retryAttempt = 0): Promise<Profile | null> => {
    if (!isMounted.current) return null;

    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 10000;
    const REQUIRED_FIELDS = 'id, name, email, phone, avatar, kyc_status, is_kyc_verified, wallet_balance, is_admin, created_at, updated_at';

    try {
      const result = await withTimeout(
        Promise.resolve(supabase.from('profiles').select(REQUIRED_FIELDS).eq('id', userId).maybeSingle()),
        TIMEOUT_MS
      ) as any;

      const { data, error } = result;

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }

      if (data && isMounted.current) {
        safeUpdate(() => setProfile(data as Profile));
        return data as Profile;
      }

      return null;
    } catch (err) {
      if (retryAttempt < MAX_RETRIES && isMounted.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retryAttempt + 1);
      }
      return null;
    }
  }, [safeUpdate]);

  const autoCreateProfile = useCallback(async (userId: string, email: string): Promise<Profile | null> => {
    if (!isMounted.current) return null;

    try {
      const newProfile: Partial<Profile> = {
        id: userId,
        name: email.split('@')[0] || 'User',
        email: email,
        kyc_status: 'Not Started',
        wallet_balance: 0,
        is_admin: false,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert([newProfile], { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      if (data && isMounted.current) {
        safeUpdate(() => setProfile(data as Profile));
      }
      return data as Profile;
    } catch (err) {
      console.error('[Profile] Auto-create failed:', err);
      return null;
    }
  }, [safeUpdate]);

  const refreshFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const { data } = await supabase
        .from('favorites')
        .select('project_id')
        .eq('user_id', session.user.id);
      if (data) {
        setFavorites(data.map(f => f.project_id));
      }
    } catch (e) {
      // Silent error
    }
  }, [session?.user?.id]);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userId = currentSession?.user?.id;
    if (!userId) return null;

    const existingProfile = await fetchProfile(userId);
    refreshFavorites();

    if (existingProfile === null && isMounted.current) {
      return await autoCreateProfile(userId, currentSession.user.email || '');
    }
    return existingProfile;
  }, [fetchProfile, autoCreateProfile, refreshFavorites]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    safeUpdate(() => {
      setProfile(null);
      setSession(null);
      setIsLocked(false);
    });
  }, [safeUpdate]);

  const setWalletBalance = useCallback((balance: number) => {
    safeUpdate(() => {
      setProfile(prev => prev ? { ...prev, wallet_balance: balance } : prev);
    });
  }, [safeUpdate]);

  const unlockApp = useCallback(async () => {
    try {
      const isBiometricEnabled = await storage.getItem('biometrics_enabled');
      if (isBiometricEnabled !== 'true') {
        safeUpdate(() => setIsLocked(false));
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock',
      });

      if (result.success) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          safeUpdate(() => {
            setSession(currentSession);
            setIsLocked(false);
          });
          return true;
        } else {
          safeUpdate(() => setIsLocked(false));
          router.replace('/login');
          return false;
        }
      }
      return false;
    } catch (err) {
      safeUpdate(() => setIsLocked(false));
      return true;
    }
  }, [safeUpdate]);

  const handleUrl = useCallback(async (url: string) => {
    if (!url || !isMounted.current) return;

    try {
      const session = await finalizeSupabaseAuthFromUrl(url);
      if (session) {
        safeUpdate(() => setSession(session));
        await fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('[DeepLink] Handle error:', err);
    }
  }, [safeUpdate, fetchProfile]);

  useEffect(() => {
    isMounted.current = true;

    const initialize = async () => {
      if (initialized.current) return;
      initialized.current = true;

      try {
        // 1. Try to load session and profile from cache first for instant startup
        const [cachedProfile, pm, isBiometricEnabled] = await Promise.all([
          storage.getItem('cached_profile'),
          storage.getItem('privacy_mode'),
          Platform.OS !== 'web' ? storage.getItem('biometrics_enabled') : Promise.resolve(null)
        ]);

        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            safeUpdate(() => setProfile(parsed));
          } catch (e) {
            // Invalid cache
          }
        }

        if (pm) safeUpdate(() => setPrivacyModeState(pm === 'true'));
        if (isBiometricEnabled === 'true' && Platform.OS !== 'web') {
          safeUpdate(() => setIsLocked(true));
        }

        // 2. Parallel initialization of Supabase data
        const [sessionRes, settingsRes] = await Promise.all([
          supabase.auth.getSession().catch(() => ({ data: { session: null } })),
          supabase.from('app_settings').select('maintenance_mode, maintenance_message').limit(1).maybeSingle().catch(() => ({ data: null }))
        ]);

        if (!isMounted.current) return;

        if (settingsRes.data) {
          safeUpdate(() => setSettings(settingsRes.data));
        }

        const currentSession = sessionRes.data.session;
        if (currentSession) {
          safeUpdate(() => setSession(currentSession));

          // 3. Parallel fetch in background
          // Use .then() to avoid blocking 'setLoading(false)'
          fetchProfile(currentSession.user.id).then(freshProfile => {
            if (freshProfile) {
              storage.setItem('cached_profile', JSON.stringify(freshProfile));
            }
          }).catch(() => {});

          refreshFavorites().catch(() => {});
        }

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) handleUrl(initialUrl);

      } catch (err) {
        // Silent error for init
      } finally {
        // Confirm loading is done so app can transition from splash
        safeUpdate(() => setLoading(false));
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      safeUpdate(() => setSession(nextSession));

      if (event === 'SIGNED_IN' && nextSession) {
        const p = await fetchProfile(nextSession.user.id);
        if (p) storage.setItem('cached_profile', JSON.stringify(p));
      } else if (event === 'SIGNED_OUT') {
        safeUpdate(() => setProfile(null));
        storage.removeItem('cached_profile');
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      }
    });

    const urlListener = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      urlListener.remove();
    };
  }, [handleUrl, fetchProfile, safeUpdate]);

  return (
    <AppContext.Provider
      value={{
        session,
        profile,
        loading,
        isAuthenticated: !!session,
        isLocked,
        privacyMode,
        favorites,
        unlockApp,
        refreshProfile,
        signOut,
        setWalletBalance,
        setPrivacyMode,
        refreshFavorites,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
