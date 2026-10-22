export type DrawerMode = 'normal' | 'expanded' | 'compact';

export type NavigationTab = 'home' | 'games' | 'health' | 'social' | 'menu';

export interface User {
  id: string;
  name: string;
  department: string;
  avatarColor: string;
  level: number;
  xp: number;
  xpGames: number;
  xpHealth: number;
  xpSocial: number;
  streak: number;
  vacationMode: boolean;
  facialLockEnabled: boolean;
  facialDetectionCompleted: boolean;
  interests: string[];
  selectedMedalIds: string[];
}

export interface Coworker {
  id: string;
  name: string;
  department: string;
  avatarColor: string;
  level: number;
  xp: number;
  streak: number;
  interests: string[];
  isFriend: boolean;
  friendRequestStatus: 'none' | 'pending' | 'accepted' | 'declined';
  selectedMedalIds: string[];
}

export interface DailyGoal {
  id: string;
  pillar: 'games' | 'health' | 'social';
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
}

export interface SharedGoal {
  title: string;
  description: string;
  currentKm: number;
  targetKm: number;
  deadlineDays: number;
}

export type GameType = 'cobrinha' | 'pong' | 'termo';

export interface GameScore {
  game: GameType;
  score: number;
  timestamp: number;
}

export interface RoundLeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  department: string;
  avatarColor: string;
}

export interface GameCycleState {
  nextReleaseTimestamp: number;
  currentGame: GameType;
  playedInCurrentCycle: boolean;
  lastScore: number;
  roundLeaderboard: RoundLeaderboardEntry[];
}

export interface HealthState {
  calibrated: boolean;
  waterUnit: 'cups' | 'ml';
  waterCount: number;
  waterTarget: number;
  lastWaterTimestamp: number;
  postureScore: number;
  pausesCount: number;
  stretchesCompleted: number;
}

export type InvitationType = 'cafe' | 'almoco' | 'sol' | 'conversa';

export interface SocialInvitation {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarColor: string;
  receiverId: string;
  receiverName: string;
  type: InvitationType;
  timestamp: number;
  status: 'pending' | 'accepted' | 'completed';
}

export type MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Medal {
  id: string;
  title: string;
  description: string;
  pillar: 'games' | 'health' | 'social' | 'special';
  tier: MedalTier;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  category: 'medal' | 'social' | 'health' | 'system';
}

export interface AppState {
  user: User;
  onboardingCompleted: boolean;
  onboardingStep: number;
  drawerOpen: boolean;
  drawerMode: DrawerMode;
  currentTab: NavigationTab;
  coworkers: Coworker[];
  dailyGoals: DailyGoal[];
  sharedGoal: SharedGoal;
  gameCycle: GameCycleState;
  health: HealthState;
  invitations: SocialInvitation[];
  medals: Medal[];
  notifications: NotificationItem[];
}
