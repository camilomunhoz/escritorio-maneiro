import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { Coworker } from './types';
import { DesktopContainer } from './components/layout/DesktopContainer';
import { DrawerHost } from './components/layout/DrawerHost';
import { DevControls } from './components/layout/DevControls';
import { BottomNav } from './components/layout/BottomNav';
import { AvatarSvg } from './components/ui/AvatarSvg';
import { Badge } from './components/ui/Badge';
import { Flame, Maximize2 } from 'lucide-react';
import { OnboardingContainer } from './components/modules/onboarding/OnboardingContainer';
import { HomeScreen } from './components/modules/home/HomeScreen';
import { GamesScreen } from './components/modules/games/GamesScreen';
import { GamePlayerExpanded } from './components/modules/games/GamePlayerExpanded';
import { HealthScreen } from './components/modules/health/HealthScreen';
import { StretchVisionExpanded } from './components/modules/health/StretchVisionExpanded';
import { SocialScreen } from './components/modules/social/SocialScreen';
import { MenuScreen } from './components/modules/menu/MenuScreen';
import { CoworkerProfileModal } from './components/modules/menu/CoworkerProfileModal';
import { MedalsShowcaseModal } from './components/modules/menu/MedalsShowcaseModal';
import { InvitationModal } from './components/modules/social/InvitationModal';
import { SharedGoalExpandedModal } from './components/modules/home/SharedGoalExpandedModal';

const DrawerContent: React.FC = () => {
  const { state, setDrawerMode, setCurrentTab, createInvitation } = useApp();

  const [selectedCoworkerProfile, setSelectedCoworkerProfile] = useState<Coworker | null>(null);
  const [showOwnProfile, setShowOwnProfile] = useState<boolean>(false);
  const [showSharedGoal, setShowSharedGoal] = useState<boolean>(false);
  const [coworkerToInvite, setCoworkerToInvite] = useState<Coworker | null>(null);
  const [showGlobalMedals, setShowGlobalMedals] = useState(false);

  // If onboarding is not completed, render the full onboarding flow
  if (!state.onboardingCompleted) {
    return <OnboardingContainer />;
  }

  // 1. Compact Mode View (50px height)
  if (state.drawerMode === 'compact') {
    return (
      <div className="w-full h-full flex items-center justify-between px-3 bg-calm-50 text-xs">
        <div className="flex items-center gap-2">
          <AvatarSvg color={state.user.avatarColor} size="sm" />
          <span className="font-semibold text-calm-800">{state.user.name}</span>
          <Badge variant="sage" size="sm">Nvl {state.user.level}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-terracottaMuted-700 font-semibold text-[11px]">
            <Flame size={12} className="fill-terracottaMuted-500 text-terracottaMuted-500" />
            <span>{state.user.streak}d</span>
          </div>
          <button
            onClick={() => setDrawerMode('normal')}
            className="p-1 rounded text-calm-500 hover:text-calm-900 transition cursor-pointer"
            title="Expandir para modo Normal"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Expanded Mode View (750x500px)
  if (state.drawerMode === 'expanded') {
    if (showSharedGoal) {
      return (
        <div className="w-full h-full relative overflow-hidden">
          <SharedGoalExpandedModal
            onClose={() => {
              setShowSharedGoal(false);
              setDrawerMode('normal');
            }}
            onOpenProfile={(coworker, isOwn) => {
              if (isOwn) {
                setShowOwnProfile(true);
              } else if (coworker) {
                setSelectedCoworkerProfile(coworker);
              }
            }}
          />

          {selectedCoworkerProfile && (
            <CoworkerProfileModal
              coworker={selectedCoworkerProfile}
              onClose={() => setSelectedCoworkerProfile(null)}
              onInvite={() => {
                setCoworkerToInvite(selectedCoworkerProfile);
                setSelectedCoworkerProfile(null);
              }}
            />
          )}

          {showOwnProfile && (
            <CoworkerProfileModal
              isOwnProfile
              onClose={() => setShowOwnProfile(false)}
            />
          )}

          {coworkerToInvite && (
            <InvitationModal
              coworker={coworkerToInvite}
              userName={state.user.name}
              userAvatarColor={state.user.avatarColor}
              onClose={() => setCoworkerToInvite(null)}
              onSend={type => {
                createInvitation(coworkerToInvite.id, type);
                setCoworkerToInvite(null);
              }}
            />
          )}
        </div>
      );
    }
    if (state.currentTab === 'games') {
      return <GamePlayerExpanded />;
    }
    if (state.currentTab === 'health') {
      return <StretchVisionExpanded onClose={() => setDrawerMode('normal')} />;
    }
    // Default expanded view for games/work
    return <GamePlayerExpanded />;
  }

  // 3. Normal Mode View (350x500px) with Bottom Navigation
  return (
    <div className="w-full h-full flex flex-col justify-between bg-white relative overflow-hidden">
      {/* Tab Screen Content */}
      <main className="flex-1 overflow-y-auto min-h-0">
        {state.currentTab === 'home' && (
          <HomeScreen
            onOpenMedals={() => setShowGlobalMedals(true)}
            onOpenOwnProfile={() => setShowOwnProfile(true)}
            onOpenSharedGoal={() => {
              setShowSharedGoal(true);
              setDrawerMode('expanded');
            }}
          />
        )}
        {state.currentTab === 'games' && (
          <GamesScreen
            onOpenCoworkerProfile={cw => setSelectedCoworkerProfile(cw)}
            onOpenOwnProfile={() => setShowOwnProfile(true)}
          />
        )}
        {state.currentTab === 'health' && (
          <HealthScreen
            onOpenStretchVision={() => {
              setCurrentTab('health');
              setDrawerMode('expanded');
            }}
          />
        )}
        {state.currentTab === 'social' && (
          <SocialScreen
            onOpenCoworkerProfile={cw => setSelectedCoworkerProfile(cw)}
          />
        )}
        {state.currentTab === 'menu' && <MenuScreen />}
      </main>

      {/* Fixed Bottom Navigation (5 tabs) */}
      <BottomNav />

      {/* Global Modals */}
      {selectedCoworkerProfile && (
        <CoworkerProfileModal
          coworker={selectedCoworkerProfile}
          onClose={() => setSelectedCoworkerProfile(null)}
          onInvite={() => {
            setCoworkerToInvite(selectedCoworkerProfile);
            setSelectedCoworkerProfile(null);
          }}
        />
      )}

      {coworkerToInvite && (
        <InvitationModal
          coworker={coworkerToInvite}
          userName={state.user.name}
          userAvatarColor={state.user.avatarColor}
          onClose={() => setCoworkerToInvite(null)}
          onSend={type => {
            createInvitation(coworkerToInvite.id, type);
            setCoworkerToInvite(null);
          }}
        />
      )}

      {showOwnProfile && (
        <CoworkerProfileModal
          isOwnProfile
          onClose={() => setShowOwnProfile(false)}
        />
      )}

      {showGlobalMedals && (
        <MedalsShowcaseModal onClose={() => setShowGlobalMedals(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <DesktopContainer>
        {/* Godmode panel for testers in the top right of the desktop */}
        <DevControls />

        {/* Anchored bottom-right drawer */}
        <DrawerHost>
          <DrawerContent />
        </DrawerHost>
      </DesktopContainer>
    </AppProvider>
  );
};

export default App;
