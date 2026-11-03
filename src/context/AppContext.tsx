import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, DrawerMode, NavigationTab, User, GameType, RoundLeaderboardEntry, NotificationItem, UserConnection, InvitationType, XpGainBadge } from '../types';
import { loadAppState, saveAppState, resetAppState } from '../services/storageService';
import { INITIAL_COWORKERS } from '../services/mockDataService';
import { getXpRewardForEncounter, calculateConnectionLevel } from '../utils/socialUtils';

interface AppContextValue {
  state: AppState;
  xpBadge: XpGainBadge | null;
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
  godmodeResetDailyGoals: () => void;
  // Shared Goal Operations
  connectApp: (appId: string) => void;
  disconnectApp: (appId: string) => void;
  // Game Cycle Operations
  finishGameRound: (score: number) => void;
  advanceGameCycle: () => void;
  // Health Operations
  registerWater: (amount?: number) => { success: boolean; message: string };
  setWaterTarget: (target: number) => void;
  setWaterUnit: (unit: 'cups' | 'ml') => void;
  calibrateHealth: (postureScore: number) => void;
  completeStretch: (repsCompleted?: number, sessionScore?: number) => void;
  // Social Operations
  sendFriendRequest: (coworkerId: string) => void;
  acceptFriendRequest: (coworkerId: string) => void;
  declineFriendRequest: (coworkerId: string) => void;
  createInvitation: (coworkerId: string, type: InvitationType) => void;
  acceptInvitation: (invitationId: string) => void;
  cancelInvitation: (invitationId: string) => void;
  validateEncounterProximity: (invitationId: string) => { success: boolean; xpEarned: number; newRelationLevel: number };
  updateUserInterests: (interests: string[]) => void;
  markNotificationsRead: () => void;
  markNotificationItemRead: (id: string) => void;
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [xpBadge, setXpBadge] = useState<XpGainBadge | null>(null);

  const allBadgeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const xpEventSeq = useRef<number>(0);
  const userRef = useRef<User>(state.user);
  userRef.current = state.user;

  const clearAllBadgeTimeouts = useCallback(() => {
    allBadgeTimeoutsRef.current.forEach(t => clearTimeout(t));
    allBadgeTimeoutsRef.current = [];
  }, []);

  const addBadgeTimeout = useCallback((fn: () => void, delayMs: number) => {
    const t = setTimeout(fn, delayMs);
    allBadgeTimeoutsRef.current.push(t);
    return t;
  }, []);

  // Clear timers on component unmount to prevent leaks
  useEffect(() => {
    return () => {
      clearAllBadgeTimeouts();
    };
  }, [clearAllBadgeTimeouts]);

  const triggerXpAnimation = useCallback((amount: number, didLevelUp = false) => {
    if (amount <= 0) return;

    // Cancel existing timers immediately to prevent conflicts, stacking, or premature hiding
    clearAllBadgeTimeouts();

    const currentEventId = ++xpEventSeq.current;

    // Immediately trigger entering animation
    setXpBadge({
      id: currentEventId,
      type: 'xp',
      text: `+${amount} XP`,
      amount,
      stage: 'enter',
    });

    // Schedule reverse transition after 3 seconds
    addBadgeTimeout(() => {
      setXpBadge(prev => {
        if (!prev || prev.id !== currentEventId) return prev;
        return { ...prev, stage: 'exit' };
      });

      // Cleanup and execute next sequence after reverse transition completes (300ms)
      addBadgeTimeout(() => {
        if (didLevelUp) {
          const levelUpEventId = ++xpEventSeq.current;

          // Trigger Level up! badge using signature terracotta orange
          setXpBadge({
            id: levelUpEventId,
            type: 'levelup',
            text: 'Level up!',
            stage: 'enter',
          });

          // Schedule reverse transition for Level up! badge after 3 seconds
          addBadgeTimeout(() => {
            setXpBadge(prev => {
              if (!prev || prev.id !== levelUpEventId) return prev;
              return { ...prev, stage: 'exit' };
            });

            // Cleanup after Level up! reverse transition completes (300ms)
            addBadgeTimeout(() => {
              setXpBadge(prev => {
                if (!prev || prev.id !== levelUpEventId) return prev;
                return null;
              });
            }, 300);
          }, 3000);
        } else {
          setXpBadge(prev => {
            if (!prev || prev.id !== currentEventId) return prev;
            return null;
          });
        }
      }, 300);
    }, 1500);
  }, [clearAllBadgeTimeouts, addBadgeTimeout]);

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
    if (amount <= 0) return;

    const prevLevel = userRef.current.level;
    const currentXp = userRef.current.xp;
    const newXP = currentXp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const didLevelUp = newLevel > prevLevel;

    // Immediately keep userRef synchronized
    userRef.current = {
      ...userRef.current,
      xp: newXP,
      level: newLevel,
    };

    // Trigger visual notification badge pipeline (XP and optionally Level up!)
    triggerXpAnimation(amount, didLevelUp);

    setState(prev => {
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
  }, [triggerXpAnimation]);

  const completeDailyGoal = useCallback((goalId: string) => {
    let rewardAmount = 0;
    let rewardPillar: 'games' | 'health' | 'social' = 'games';

    setState(prev => {
      const goal = prev.dailyGoals.find(g => g.id === goalId);
      if (!goal || goal.completed) return prev;

      rewardAmount = goal.xpReward;
      rewardPillar = goal.pillar;

      const updatedGoals = prev.dailyGoals.map(g =>
        g.id === goalId ? { ...g, completed: true, progress: g.target } : g
      );

      const completionNotif: NotificationItem = {
        id: `notif-goal-${Date.now()}-${goal.id}`,
        title: 'Meta diária concluída',
        message: `Você concluiu "${goal.title}" e recebeu +${goal.xpReward} XP.`,
        timestamp: Date.now(),
        read: false,
        category: goal.pillar,
        goToTab: 'home',
      };

      return {
        ...prev,
        dailyGoals: updatedGoals,
        notifications: [completionNotif, ...prev.notifications],
      };
    });

    if (rewardAmount > 0) {
      addXP(rewardAmount, rewardPillar);
    }
  }, [addXP]);

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

  // Game Rotation Helpers
  const GAME_ROTATION_SEQUENCE: GameType[] = ['cobrinha', 'pong', 'termo'];

  const getNextGameType = (current: GameType): GameType => {
    const currentIdx = GAME_ROTATION_SEQUENCE.indexOf(current);
    if (currentIdx === -1) return GAME_ROTATION_SEQUENCE[0];
    return GAME_ROTATION_SEQUENCE[(currentIdx + 1) % GAME_ROTATION_SEQUENCE.length];
  };

  const getFreshRoundLeaderboard = (game: GameType): RoundLeaderboardEntry[] => {
    const mockScores: Record<GameType, number[]> = {
      cobrinha: [95, 80, 65, 45],
      pong: [110, 85, 70, 50],
      termo: [100, 85, 75, 60],
    };
    const scores = mockScores[game] || [90, 75, 60, 40];
    const targets = [
      { id: 'cw-2', score: scores[0] },
      { id: 'cw-6', score: scores[1] },
      { id: 'cw-8', score: scores[2] },
      { id: 'cw-1', score: scores[3] },
    ];
    return targets.map(t => {
      const cw = INITIAL_COWORKERS.find(c => c.id === t.id);
      return {
        userId: t.id,
        name: cw ? cw.name : 'Colega',
        score: t.score,
        department: cw ? cw.department : 'Geral',
        avatarColor: cw ? cw.avatarColor : '#5A6B7C',
        avatarBody: cw?.avatarBody,
        avatarFace: cw?.avatarFace,
      };
    });
  };

  // Godmode helpers
  const godmodeUnlockNextGame = useCallback(() => {
    setState(prev => {
      const nextGame = getNextGameType(prev.gameCycle.currentGame);
      const gameNames: Record<GameType, string> = {
        cobrinha: 'Cobrinha',
        pong: 'Pong',
        termo: 'Termo',
      };
      const gameName = gameNames[nextGame] || 'Novo Jogo';
      const newGameNotif: NotificationItem = {
        id: `notif-game-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Novo jogo liberado!',
        message: `${gameName} está disponível para uma pausa rápida. Aproveite!`,
        timestamp: Date.now(),
        read: false,
        category: 'games',
        goToTab: 'games',
      };
      return {
        ...prev,
        notifications: [newGameNotif, ...prev.notifications],
        gameCycle: {
          ...prev.gameCycle,
          currentGame: nextGame,
          playedInCurrentCycle: false,
          lastScore: 0,
          nextReleaseTimestamp: Date.now() - 1000,
          roundLeaderboard: getFreshRoundLeaderboard(nextGame),
        },
      };
    });
  }, []);

  const godmodeSimulateWater = useCallback(() => {
    setState(prev => {
      const newCount = Math.min(prev.health.waterTarget, prev.health.waterCount + 200);
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

  const godmodeResetDailyGoals = useCallback(() => {
    setState(prev => {
      let xpToDeduct = 0;
      let xpGamesDeduct = 0;
      let xpHealthDeduct = 0;
      let xpSocialDeduct = 0;

      prev.dailyGoals.forEach(g => {
        if (g.completed) {
          xpToDeduct += g.xpReward;
          if (g.pillar === 'games') xpGamesDeduct += g.xpReward;
          else if (g.pillar === 'health') xpHealthDeduct += g.xpReward;
          else if (g.pillar === 'social') xpSocialDeduct += g.xpReward;
        }
      });

      const newXP = Math.max(0, prev.user.xp - xpToDeduct);
      const newLevel = Math.max(1, Math.floor(newXP / 100) + 1);
      const newXpGames = Math.max(0, prev.user.xpGames - xpGamesDeduct);
      const newXpHealth = Math.max(0, prev.user.xpHealth - xpHealthDeduct);
      const newXpSocial = Math.max(0, prev.user.xpSocial - xpSocialDeduct);

      const resetGoals = prev.dailyGoals.map(g => ({
        ...g,
        completed: false,
        progress: 0,
      }));

      return {
        ...prev,
        dailyGoals: resetGoals,
        user: {
          ...prev.user,
          xp: newXP,
          level: newLevel,
          xpGames: newXpGames,
          xpHealth: newXpHealth,
          xpSocial: newXpSocial,
        },
      };
    });
  }, []);

  // Shared Goal Operations
  const connectApp = useCallback((appId: string) => {
    setState(prev => {
      const currentApps = prev.sharedGoal.connectedApps || [];
      if (currentApps.includes(appId)) return prev;

      return {
        ...prev,
        sharedGoal: {
          ...prev.sharedGoal,
          connectedApps: [...currentApps, appId],
        },
      };
    });
  }, []);

  const disconnectApp = useCallback((appId: string) => {
    setState(prev => {
      const currentApps = prev.sharedGoal.connectedApps || [];
      return {
        ...prev,
        sharedGoal: {
          ...prev.sharedGoal,
          connectedApps: currentApps.filter(id => id !== appId),
        },
      };
    });
  }, []);

  // Game Cycle Operations
  const finishGameRound = useCallback((score: number) => {
    const xpEarned = Math.min(100, Math.max(20, Math.floor(score / 2)));

    setState(prev => {
      const newRoundLeaderboard = [
        ...prev.gameCycle.roundLeaderboard.filter(e => e.userId !== prev.user.id),
        {
          userId: prev.user.id,
          name: prev.user.name,
          score,
          department: prev.user.department,
          avatarColor: prev.user.avatarColor,
          avatarBody: prev.user.avatarBody,
          avatarFace: prev.user.avatarFace,
        },
      ].sort((a, b) => b.score - a.score);

      // Advance daily games goal if present
      const updatedGoals = prev.dailyGoals.map(g =>
        g.pillar === 'games' ? { ...g, completed: true, progress: g.target } : g
      );

      return {
        ...prev,
        dailyGoals: updatedGoals,
        gameCycle: {
          ...prev.gameCycle,
          playedInCurrentCycle: true,
          lastScore: score,
          roundLeaderboard: newRoundLeaderboard,
        },
      };
    });

    addXP(xpEarned, 'games');
  }, [addXP]);

  const advanceGameCycle = useCallback(() => {
    setState(prev => {
      const nextGame = getNextGameType(prev.gameCycle.currentGame);
      const gameNames: Record<GameType, string> = {
        cobrinha: 'Cobrinha',
        pong: 'Pong',
        termo: 'Termo',
      };
      const gameName = gameNames[nextGame] || 'Novo Jogo';
      const newGameNotif: NotificationItem = {
        id: `notif-game-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Novo jogo liberado!',
        message: `${gameName} está disponível para uma pausa rápida. Aproveite!`,
        timestamp: Date.now(),
        read: false,
        category: 'games',
        goToTab: 'games',
      };
      return {
        ...prev,
        notifications: [newGameNotif, ...prev.notifications],
        gameCycle: {
          ...prev.gameCycle,
          currentGame: nextGame,
          playedInCurrentCycle: false,
          lastScore: 0,
          nextReleaseTimestamp: Date.now() + 3 * 60 * 60 * 1000,
          roundLeaderboard: getFreshRoundLeaderboard(nextGame),
        },
      };
    });
  }, []);

  // Health Operations
  const registerWater = useCallback((amount = 200): { success: boolean; message: string } => {
    let result = { success: true, message: 'Registro de água efetuado com sucesso.' };
    let xpToAdd = 0;

    setState(prev => {
      const now = Date.now();
      const thirtyMinutesMs = 30 * 60 * 1000;
      const timeSinceLast = now - prev.health.lastWaterTimestamp;

      // 30-minute spacing rule for daily goal validation
      const isValidForGoal = prev.health.lastWaterTimestamp === 0 || timeSinceLast >= thirtyMinutesMs;

      const newCount = prev.health.waterCount + amount;
      const isTargetReached = newCount >= prev.health.waterTarget;

      let updatedGoals = prev.dailyGoals;
      let earnedXp = 2;

      if (isValidForGoal) {
        updatedGoals = prev.dailyGoals.map(g => {
          if (g.pillar === 'health' && !g.completed) {
            const nextProgress = Math.min(g.target, g.progress + 1);
            const isCompleted = nextProgress >= g.target || isTargetReached;
            if (isCompleted) {
              earnedXp += g.xpReward;
            }
            return {
              ...g,
              progress: isCompleted ? g.target : nextProgress,
              completed: isCompleted,
            };
          }
          return g;
        });
      }

      xpToAdd = earnedXp;

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
      };
    });

    if (xpToAdd > 0) {
      addXP(xpToAdd, 'health');
    }

    return result;
  }, [addXP]);

  const setWaterTarget = useCallback((target: number) => {
    setState(prev => ({
      ...prev,
      health: {
        ...prev.health,
        waterTarget: Math.max(100, target),
      },
    }));
  }, []);

  const setWaterUnit = useCallback((_unit: 'cups' | 'ml') => {
    // Unidade padronizada em mL
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

  const completeStretch = useCallback((repsCompleted = 1, sessionScore = 25) => {
    if (repsCompleted <= 0) return;
    const xpEarned = Math.min(100, Math.max(15, Math.round(sessionScore * 0.6)));
    const postureGain = Math.min(15, repsCompleted * 5);

    setState(prev => {
      const newStretches = prev.health.stretchesCompleted + repsCompleted;
      return {
        ...prev,
        health: {
          ...prev.health,
          calibrated: true,
          stretchesCompleted: newStretches,
          postureScore: Math.min(98, prev.health.postureScore + postureGain),
        },
      };
    });

    addXP(xpEarned, 'health');
  }, [addXP]);

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

  const createInvitation = useCallback((coworkerId: string, type: InvitationType) => {
    let socialReward = 0;

    setState(prev => {
      const coworker = prev.coworkers.find(c => c.id === coworkerId);
      if (!coworker) return prev;

      const newInvitation = {
        id: `inv-${Date.now()}`,
        senderId: prev.user.id,
        senderName: prev.user.name,
        senderAvatarColor: prev.user.avatarColor,
        senderAvatarBody: prev.user.avatarBody,
        senderAvatarFace: prev.user.avatarFace,
        receiverId: coworker.id,
        receiverName: coworker.name,
        type,
        timestamp: Date.now(),
        status: 'pending' as const,
      };

      // Mark daily social goal as completed (sending an invite satisfies the daily goal)
      const updatedGoals = prev.dailyGoals.map(g => {
        if (g.pillar === 'social' && !g.completed) {
          socialReward = g.xpReward;
          return { ...g, completed: true, progress: g.target };
        }
        return g;
      });

      return {
        ...prev,
        invitations: [newInvitation, ...prev.invitations],
        dailyGoals: updatedGoals,
      };
    });

    if (socialReward > 0) {
      addXP(socialReward, 'social');
    }
  }, [addXP]);

  const acceptInvitation = useCallback((invitationId: string) => {
    setState(prev => {
      const now = Date.now();
      const threeHoursMs = 3 * 60 * 60 * 1000;
      const targetInv = prev.invitations.find(i => i.id === invitationId);
      if (!targetInv) return prev;

      const updatedInvitations = prev.invitations.map(inv =>
        inv.id === invitationId
          ? {
              ...inv,
              status: 'accepted' as const,
              acceptedAt: now,
              expiresAt: now + threeHoursMs,
            }
          : inv
      );

      return {
        ...prev,
        invitations: updatedInvitations,
      };
    });
  }, []);

  const cancelInvitation = useCallback((invitationId: string) => {
    // Cancelamento silencioso: remove sem badge, sem alerta, sem resíduo de histórico
    setState(prev => ({
      ...prev,
      invitations: prev.invitations.filter(i => i.id !== invitationId),
      notifications: prev.notifications.filter(n => !n.id.includes(invitationId)),
    }));
  }, []);

  const validateEncounterProximity = useCallback((invitationId: string) => {
    let result = { success: false, xpEarned: 0, newRelationLevel: 1 };
    const individualXpGain = 40;
    let shouldAwardXp = false;

    setState(prev => {
      const targetInv = prev.invitations.find(i => i.id === invitationId);
      if (!targetInv || targetInv.status !== 'accepted') return prev;

      const partnerId = targetInv.senderId === prev.user.id ? targetInv.receiverId : targetInv.senderId;
      const partnerName = targetInv.senderId === prev.user.id ? targetInv.receiverName : targetInv.senderName;
      const existingConn = prev.connections.find(c => c.coworkerId === partnerId);
      const currentLevel = existingConn?.level || 1;

      // XP geral ganho começa em 50 e sobe 10 a cada nível de relação
      const xpEarned = getXpRewardForEncounter(currentLevel);
      const newSharedXp = (existingConn?.sharedXp || 0) + xpEarned;
      const levelInfo = calculateConnectionLevel(newSharedXp);

      result = {
        success: true,
        xpEarned,
        newRelationLevel: levelInfo.level,
      };
      shouldAwardXp = true;

      const updatedConn: UserConnection = {
        id: existingConn?.id || `conn-${partnerId}`,
        coworkerId: partnerId,
        sharedXp: newSharedXp,
        level: levelInfo.level,
        encountersCount: (existingConn?.encountersCount || 0) + 1,
        lastEncounterTimestamp: Date.now(),
      };

      const otherConnections = prev.connections.filter(c => c.coworkerId !== partnerId);

      // Atualiza o convite para concluído
      const updatedInvitations = prev.invitations.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: 'completed' as const }
          : inv
      );

      // Marca colega como amigo no registro de coworker
      const updatedCoworkers = prev.coworkers.map(cw =>
        cw.id === partnerId
          ? { ...cw, isFriend: true, friendRequestStatus: 'accepted' as const }
          : cw
      );

      const completionNotification: NotificationItem = {
        id: `notif-enc-${Date.now()}`,
        title: 'Encontro validado com sucesso',
        message: `Sua presença com ${partnerName} foi confirmada. Vínculo fortalecido (+${xpEarned} XP compartilhado).`,
        timestamp: Date.now(),
        read: false,
        category: 'social',
        goToTab: 'social',
      };

      return {
        ...prev,
        invitations: updatedInvitations,
        connections: [updatedConn, ...otherConnections],
        coworkers: updatedCoworkers,
        notifications: [completionNotification, ...prev.notifications],
      };
    });

    if (shouldAwardXp) {
      addXP(individualXpGain, 'social');
    }

    return result;
  }, [addXP]);

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

  const markNotificationItemRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const value: AppContextValue = {
    state,
    xpBadge,
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
    godmodeResetDailyGoals,
    connectApp,
    disconnectApp,
    finishGameRound,
    advanceGameCycle,
    registerWater,
    setWaterTarget,
    setWaterUnit,
    calibrateHealth,
    completeStretch,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createInvitation,
    acceptInvitation,
    cancelInvitation,
    validateEncounterProximity,
    updateUserInterests,
    markNotificationsRead,
    markNotificationItemRead,
    showNotifications,
    setShowNotifications,
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
