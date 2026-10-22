import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppState, DrawerMode, NavigationTab, User } from '../types';
import { loadAppState, saveAppState, resetAppState } from '../services/storageService';

interface AppContextValue {
  state: AppState;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  setDrawerMode: (mode: DrawerMode) => void;
  setCurrentTab: (tab: NavigationTab) => void;
  updateUser: (partial: Partial<User>) => void;
  completeDailyGoal: (goalId: string) => void;
  addXP: (amount: number, pillar?: 'games' | 'health' | 'social') => void;
  toggleVacationMode: () => void;
  toggleFacialLock: () => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  reopenOnboarding: () => void;
  resetAllData: () => void;
  // Godmode helpers
  isGodmodeOpen: boolean;
  setGodmodeOpen: (open: boolean) => void;
  toggleGodmode: () => void;
  godmodeUnlockNextGame: () => void;
  godmodeSimulateWater: () => void;
  godmodeSimulatePostureAlert: () => void;
  // Game Cycle Operations
  finishGameRound: (score: number) => void;
  advanceGameCycle: () => void;
  // Health Operations
  registerWater: (amount?: number) => { success: boolean; message: string };
  setWaterUnit: (unit: 'cups' | 'ml') => void;
  calibrateHealth: (postureScore: number) => void;
  completeStretch: () => void;
  // Social Operations
  sendFriendRequest: (coworkerId: string) => void;
  acceptFriendRequest: (coworkerId: string) => void;
  declineFriendRequest: (coworkerId: string) => void;
  createInvitation: (coworkerId: string, type: 'cafe' | 'almoco' | 'sol' | 'conversa') => void;
  updateUserInterests: (interests: string[]) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());

  const [isGodmodeOpen, setGodmodeOpen] = useState<boolean>(false);
  const toggleGodmode = useCallback(() => {
    setGodmodeOpen(prev => !prev);
  }, []);

  // Automatically persist to localStorage whenever state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const setDrawerOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, drawerOpen: open }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }));
  }, []);

  const setDrawerMode = useCallback((mode: DrawerMode) => {
    setState(prev => ({ ...prev, drawerMode: mode }));
  }, []);

  const setCurrentTab = useCallback((tab: NavigationTab) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...partial },
    }));
  }, []);

  const addXP = useCallback((amount: number, pillar: 'games' | 'health' | 'social' = 'games') => {
    setState(prev => {
      const newXP = prev.user.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      const xpGames = pillar === 'games' ? prev.user.xpGames + amount : prev.user.xpGames;
      const xpHealth = pillar === 'health' ? prev.user.xpHealth + amount : prev.user.xpHealth;
      const xpSocial = pillar === 'social' ? prev.user.xpSocial + amount : prev.user.xpSocial;

      return {
        ...prev,
        user: {
          ...prev.user,
          xp: newXP,
          level: newLevel,
          xpGames,
          xpHealth,
          xpSocial,
        },
      };
    });
  }, []);

  const completeDailyGoal = useCallback((goalId: string) => {
    setState(prev => {
      const goal = prev.dailyGoals.find(g => g.id === goalId);
      if (!goal || goal.completed) return prev;

      const updatedGoals = prev.dailyGoals.map(g =>
        g.id === goalId ? { ...g, completed: true, progress: g.target } : g
      );

      // Reward XP based on pillar
      const newXP = prev.user.xp + goal.xpReward;
      const newLevel = Math.floor(newXP / 100) + 1;
      const xpGames = goal.pillar === 'games' ? prev.user.xpGames + goal.xpReward : prev.user.xpGames;
      const xpHealth = goal.pillar === 'health' ? prev.user.xpHealth + goal.xpReward : prev.user.xpHealth;
      const xpSocial = goal.pillar === 'social' ? prev.user.xpSocial + goal.xpReward : prev.user.xpSocial;

      return {
        ...prev,
        dailyGoals: updatedGoals,
        user: {
          ...prev.user,
          xp: newXP,
          level: newLevel,
          xpGames,
          xpHealth,
          xpSocial,
        },
      };
    });
  }, []);

  const toggleVacationMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, vacationMode: !prev.user.vacationMode },
    }));
  }, []);

  const toggleFacialLock = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, facialLockEnabled: !prev.user.facialLockEnabled },
    }));
  }, []);

  const setOnboardingStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, onboardingStep: step }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      onboardingCompleted: true,
      drawerMode: 'normal',
      currentTab: 'home',
    }));
  }, []);

  const reopenOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      onboardingCompleted: false,
      drawerOpen: true,
      drawerMode: 'normal',
    }));
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = resetAppState();
    setState(fresh);
  }, []);

  // Godmode helpers
  const godmodeUnlockNextGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameCycle: {
        ...prev.gameCycle,
        nextReleaseTimestamp: Date.now() - 1000,
        playedInCurrentCycle: false,
      },
    }));
  }, []);

  const godmodeSimulateWater = useCallback(() => {
    setState(prev => {
      const newCount = Math.min(prev.health.waterTarget, prev.health.waterCount + 1);
      return {
        ...prev,
        health: {
          ...prev.health,
          waterCount: newCount,
          lastWaterTimestamp: Date.now(),
        },
      };
    });
  }, []);

  const godmodeSimulatePostureAlert = useCallback(() => {
    setState(prev => ({
      ...prev,
      health: {
        ...prev.health,
        postureScore: Math.max(50, prev.health.postureScore - 15),
      },
    }));
  }, []);

  // Game Cycle Operations
  const finishGameRound = useCallback((score: number) => {
    setState(prev => {
      const xpEarned = Math.min(100, Math.max(20, Math.floor(score / 2)));
      
      const newRoundLeaderboard = [
        ...prev.gameCycle.roundLeaderboard.filter(e => e.userId !== prev.user.id),
        {
          userId: prev.user.id,
          name: prev.user.name,
          score,
          department: prev.user.department,
          avatarColor: prev.user.avatarColor,
        },
      ].sort((a, b) => b.score - a.score);

      // Advance daily games goal if present
      const updatedGoals = prev.dailyGoals.map(g =>
        g.pillar === 'games' ? { ...g, completed: true, progress: g.target } : g
      );

      const newXP = prev.user.xp + xpEarned;
      const newLevel = Math.floor(newXP / 100) + 1;
      const xpGames = prev.user.xpGames + xpEarned;

      return {
        ...prev,
        dailyGoals: updatedGoals,
        gameCycle: {
          ...prev.gameCycle,
          playedInCurrentCycle: true,
          lastScore: score,
          roundLeaderboard: newRoundLeaderboard,
        },
        user: {
          ...prev.user,
          xp: newXP,
          level: newLevel,
          xpGames,
        },
      };
    });
  }, []);

  const advanceGameCycle = useCallback(() => {
    setState(prev => {
      const sequence: ('cobrinha' | 'pong' | 'termo')[] = ['cobrinha', 'pong', 'termo'];
      const currentIdx = sequence.indexOf(prev.gameCycle.currentGame);
      const nextGame = sequence[(currentIdx + 1) % sequence.length];
      return {
        ...prev,
        gameCycle: {
          ...prev.gameCycle,
          currentGame: nextGame,
          playedInCurrentCycle: false,
          nextReleaseTimestamp: Date.now() + 3 * 60 * 60 * 1000,
        },
      };
    });
  }, []);

  // Health Operations
  const registerWater = useCallback((amount = 1): { success: boolean; message: string } => {
    let result = { success: true, message: 'Registro de água efetuado com sucesso.' };
    setState(prev => {
      const now = Date.now();
      const thirtyMinutesMs = 30 * 60 * 1000;
      const timeSinceLast = now - prev.health.lastWaterTimestamp;

      // 30-minute spacing rule for daily goal validation
      const isValidForGoal = prev.health.lastWaterTimestamp === 0 || timeSinceLast >= thirtyMinutesMs;

      const newCount = prev.health.waterCount + amount;
      const isTargetReached = newCount >= prev.health.waterTarget;

      let updatedGoals = prev.dailyGoals;
      let newXP = prev.user.xp;
      let xpHealth = prev.user.xpHealth;
      let newLevel = prev.user.level;

      if (isValidForGoal && isTargetReached) {
        updatedGoals = prev.dailyGoals.map(g =>
          g.pillar === 'health' ? { ...g, completed: true, progress: g.target } : g
        );
        newXP += 40;
        xpHealth += 40;
        newLevel = Math.floor(newXP / 100) + 1;
      }

      if (!isValidForGoal) {
        result = {
          success: true,
          message: 'Água registrada. Lembre-se: o corpo absorve melhor pequenas doses espaçadas em pelo menos 30 minutos.',
        };
      }

      return {
        ...prev,
        dailyGoals: updatedGoals,
        health: {
          ...prev.health,
          waterCount: newCount,
          lastWaterTimestamp: now,
        },
        user: {
          ...prev.user,
          xp: newXP,
          xpHealth,
          level: newLevel,
        },
      };
    });
    return result;
  }, []);

  const setWaterUnit = useCallback((unit: 'cups' | 'ml') => {
    setState(prev => {
      const isSwitchToMl = unit === 'ml';
      const target = isSwitchToMl ? 2000 : 8;
      const count = isSwitchToMl ? prev.health.waterCount * 250 : Math.round(prev.health.waterCount / 250);
      return {
        ...prev,
        health: {
          ...prev.health,
          waterUnit: unit,
          waterTarget: target,
          waterCount: count,
        },
      };
    });
  }, []);

  const calibrateHealth = useCallback((postureScore: number) => {
    setState(prev => ({
      ...prev,
      health: {
        ...prev.health,
        calibrated: true,
        postureScore,
      },
    }));
  }, []);

  const completeStretch = useCallback(() => {
    setState(prev => {
      const newStretches = prev.health.stretchesCompleted + 1;
      const newXP = prev.user.xp + 25;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        ...prev,
        health: {
          ...prev.health,
          stretchesCompleted: newStretches,
          postureScore: Math.min(98, prev.health.postureScore + 10),
        },
        user: {
          ...prev.user,
          xp: newXP,
          xpHealth: prev.user.xpHealth + 25,
          level: newLevel,
        },
      };
    });
  }, []);

  // Social Operations
  const sendFriendRequest = useCallback((coworkerId: string) => {
    setState(prev => ({
      ...prev,
      coworkers: prev.coworkers.map(cw =>
        cw.id === coworkerId ? { ...cw, friendRequestStatus: 'pending' as const } : cw
      ),
    }));
  }, []);

  const acceptFriendRequest = useCallback((coworkerId: string) => {
    setState(prev => ({
      ...prev,
      coworkers: prev.coworkers.map(cw =>
        cw.id === coworkerId ? { ...cw, isFriend: true, friendRequestStatus: 'accepted' as const } : cw
      ),
    }));
  }, []);

  const declineFriendRequest = useCallback((coworkerId: string) => {
    // Silent decline: no alerting the other user publicly
    setState(prev => ({
      ...prev,
      coworkers: prev.coworkers.map(cw =>
        cw.id === coworkerId ? { ...cw, friendRequestStatus: 'declined' as const } : cw
      ),
    }));
  }, []);

  const createInvitation = useCallback((coworkerId: string, type: 'cafe' | 'almoco' | 'sol' | 'conversa') => {
    setState(prev => {
      const coworker = prev.coworkers.find(c => c.id === coworkerId);
      if (!coworker) return prev;

      const newInvitation = {
        id: `inv-${Date.now()}`,
        senderId: prev.user.id,
        senderName: prev.user.name,
        senderAvatarColor: prev.user.avatarColor,
        receiverId: coworker.id,
        receiverName: coworker.name,
        type,
        timestamp: Date.now(),
        status: 'accepted' as const, // auto-accepted for prototype demonstration
      };

      // Mark daily social goal as completed
      const updatedGoals = prev.dailyGoals.map(g =>
        g.pillar === 'social' ? { ...g, completed: true, progress: g.target } : g
      );

      const newXP = prev.user.xp + 40;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        ...prev,
        invitations: [newInvitation, ...prev.invitations],
        dailyGoals: updatedGoals,
        user: {
          ...prev.user,
          xp: newXP,
          xpSocial: prev.user.xpSocial + 40,
          level: newLevel,
        },
      };
    });
  }, []);

  const updateUserInterests = useCallback((interests: string[]) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, interests },
    }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const value: AppContextValue = {
    state,
    setDrawerOpen,
    toggleDrawer,
    setDrawerMode,
    setCurrentTab,
    updateUser,
    completeDailyGoal,
    addXP,
    toggleVacationMode,
    toggleFacialLock,
    setOnboardingStep,
    completeOnboarding,
    reopenOnboarding,
    resetAllData,
    isGodmodeOpen,
    setGodmodeOpen,
    toggleGodmode,
    godmodeUnlockNextGame,
    godmodeSimulateWater,
    godmodeSimulatePostureAlert,
    finishGameRound,
    advanceGameCycle,
    registerWater,
    setWaterUnit,
    calibrateHealth,
    completeStretch,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createInvitation,
    updateUserInterests,
    markNotificationsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
