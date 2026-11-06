import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ModalZIndexProvider } from './context/ModalZIndexContext';
import type { Coworker, NavigationTab } from './types';
import { DesktopContainer, DevControls } from './components/desktop';
import { DrawerHost } from './components/layout/DrawerHost';
import { BottomNav } from './components/layout/BottomNav';
import { OnboardingContainer } from './components/modules/onboarding/OnboardingContainer';
import { HomeScreen } from './components/modules/home/HomeScreen';
import { GamesScreen } from './components/modules/games/GamesScreen';
import { GamePlayerExpanded } from './components/modules/games/GamePlayerExpanded';
import { HealthScreen } from './components/modules/health/HealthScreen';
import { GuidedStretchModal } from './components/modules/health/GuidedStretchModal';
import { PostureCalibrationModal } from './components/modules/health/PostureCalibrationModal';
import { FacialDetectionModal } from './components/modules/menu/FacialDetectionModal';
import { SocialScreen } from './components/modules/social/SocialScreen';
import { CoworkerProfileModal } from './components/modules/menu/CoworkerProfileModal';
import { MedalsShowcaseModal } from './components/modules/menu/MedalsShowcaseModal';
import { InvitationModal } from './components/modules/social/InvitationModal';
import { SharedGoalExpandedModal } from './components/modules/home/SharedGoalExpandedModal';
import { GlobalLeaderboardExpandedModal } from './components/modules/games/GlobalLeaderboardExpandedModal';
import { NotificationsScreen } from './components/modules/notifications/NotificationsScreen';
import { MenuPopup } from './components/modules/menu/MenuPopup';
import { SettingsModal } from './components/modules/menu/SettingsModal';
import { AvatarCustomizerModal } from './components/modules/menu/AvatarCustomizerModal';

const DrawerContent: React.FC = () => {
  const {
    state,
    setDrawerMode,
    setCurrentTab,
    createInvitation,
    showNotifications,
    setShowNotifications,
    calibrateHealth,
  } = useApp();

  // Active expanded environments
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(false);
  const [showSharedGoal, setShowSharedGoal] = useState<boolean>(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState<boolean>(false);
  const [showStretchVision, setShowStretchVision] = useState<boolean>(false);
  const [showPostureCalibration, setShowPostureCalibration] = useState<boolean>(false);
  const [showFacialDetection, setShowFacialDetection] = useState<boolean>(false);
  const [showGlobalMedals, setShowGlobalMedals] = useState<boolean>(false);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);

  // Normal overlays
  const [selectedCoworkerProfile, setSelectedCoworkerProfile] = useState<Coworker | null>(null);
  const [showOwnProfile, setShowOwnProfile] = useState<boolean>(false);
  const [coworkerToInvite, setCoworkerToInvite] = useState<Coworker | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [socialSubTab, setSocialSubTab] = useState<'recommendations' | 'connections' | 'invitations'>('recommendations');

  const isPopoverActive = Boolean(
    showOwnProfile || showAvatarModal || showGlobalMedals || showSettingsModal
  );

  const isExpanded = Boolean(
    isPlayingGame ||
    showSharedGoal ||
    showGlobalLeaderboard ||
    showStretchVision ||
    showPostureCalibration ||
    showFacialDetection ||
    showAvatarModal ||
    showGlobalMedals ||
    coworkerToInvite
  );

  // Synchronize drawer structure whenever an expanded environment opens or closes
  React.useEffect(() => {
    setDrawerMode(isExpanded ? 'expanded' : 'normal');
  }, [isExpanded, setDrawerMode]);

  const closeAllOverlays = React.useCallback(() => {
    setShowOwnProfile(false);
    setShowSettingsModal(false);
    setShowAvatarModal(false);
    setShowGlobalMedals(false);
    setShowSharedGoal(false);
    setShowGlobalLeaderboard(false);

    setShowStretchVision(false);
    setShowPostureCalibration(false);
    setShowFacialDetection(false);
    setSelectedCoworkerProfile(null);
    setCoworkerToInvite(null);
    setIsMenuOpen(false);
  }, []);

  const handleSelectTab = (tabId: NavigationTab) => {
    closeAllOverlays();
    setIsPlayingGame(false);
    setShowStretchVision(false);
    setShowPostureCalibration(false);
    setShowFacialDetection(false);
    setCurrentTab(tabId);
  };

  // Close overlays on tab navigation
  React.useEffect(() => {
    closeAllOverlays();
  }, [state.currentTab, closeAllOverlays]);

  // If onboarding is not completed, render the full onboarding flow
  if (!state.onboardingCompleted) {
    return <OnboardingContainer />;
  }

  // 1. Expanded Mode View (750x500px)
  // Structural definition: environments that need 750px render full expanded view
  if (isExpanded) {
    let expandedBase: React.ReactNode = null;

    if (isPlayingGame) {
      expandedBase = <GamePlayerExpanded onExit={() => setIsPlayingGame(false)} />;
    } else if (showStretchVision) {
      expandedBase = <GuidedStretchModal onClose={() => setShowStretchVision(false)} />;
    } else if (showSharedGoal) {
      expandedBase = (
        <SharedGoalExpandedModal
          onClose={() => {
            setShowSharedGoal(false);
    setShowGlobalLeaderboard(false);

          }}
          onOpenProfile={(coworker, isOwn) => {
            if (isOwn) {
              setShowOwnProfile(true);
            } else if (coworker) {
              setSelectedCoworkerProfile(coworker);
            }
          }}
        />
      );
    } else if (showGlobalLeaderboard) {
      expandedBase = (
        <GlobalLeaderboardExpandedModal
          onClose={() => setShowGlobalLeaderboard(false)}
          onOpenProfile={(coworker, isOwn) => {
            if (isOwn) {
              setShowOwnProfile(true);
            } else if (coworker) {
              setSelectedCoworkerProfile(coworker);
            }
          }}
        />
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden bg-white">
        {expandedBase}

        {/* Dynamic Modals in Expanded Mode: layered with dynamic z-index */}
        {showPostureCalibration && (
          <PostureCalibrationModal
            onClose={() => setShowPostureCalibration(false)}
            onCalibrate={score => {
              calibrateHealth(score);
              setShowPostureCalibration(false);
            }}
          />
        )}

        {showFacialDetection && (
          <FacialDetectionModal
            onClose={() => setShowFacialDetection(false)}
          />
        )}

        {showAvatarModal && (
          <AvatarCustomizerModal onClose={() => setShowAvatarModal(false)} />
        )}

        {showGlobalMedals && (
          <MedalsShowcaseModal onClose={() => setShowGlobalMedals(false)} />
        )}

        {selectedCoworkerProfile && (
          <CoworkerProfileModal
            coworker={selectedCoworkerProfile}
            onClose={() => setSelectedCoworkerProfile(null)}
            onInvite={() => {
              setCoworkerToInvite(selectedCoworkerProfile);
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
            userAvatarBody={state.user.avatarBody}
            userAvatarFace={state.user.avatarFace}
            onClose={() => setCoworkerToInvite(null)}
            onSend={type => {
              createInvitation(coworkerToInvite.id, type);
              setCoworkerToInvite(null);
            }}
          />
        )}

        {/* Notifications above everything in expanded mode */}
        {showNotifications && (
          <NotificationsScreen
            onClose={() => setShowNotifications(false)}
            onOpenMedals={() => {
              setShowNotifications(false);
              setShowGlobalMedals(true);
            }}
            onNavigateToSocialSubTab={subTab => {
              setShowNotifications(false);
              closeAllOverlays();
              setSocialSubTab(subTab);
            }}
          />
        )}
      </div>
    );
  }

  // 2. Normal Mode View (350x500px) with Bottom Navigation
  return (
    <div className="w-full h-full flex flex-col justify-between bg-white relative overflow-hidden">
      {/* Tab Screen Content */}
      <main className="flex-1 overflow-hidden min-h-0 relative">
        {state.currentTab === 'home' && (
          <HomeScreen
            onOpenMedals={() => {
              closeAllOverlays();
              setShowGlobalMedals(true);
            }}
            onOpenOwnProfile={() => {
              closeAllOverlays();
              setShowOwnProfile(true);
            }}
            onOpenSharedGoal={() => {
              closeAllOverlays();
              setShowSharedGoal(true);
            }}
          />
        )}
        {state.currentTab === 'games' && (
          <GamesScreen
            onOpenCoworkerProfile={cw => {
              closeAllOverlays();
              setSelectedCoworkerProfile(cw);
            }}
            onOpenOwnProfile={() => {
              closeAllOverlays();
              setShowOwnProfile(true);
            }}
            onStartGame={() => {
              setIsPlayingGame(true);
            }}
            onOpenGlobalLeaderboard={() => {
              closeAllOverlays();
              setShowGlobalLeaderboard(true);
            }}
          />
        )}
        {state.currentTab === 'health' && (
          <HealthScreen
            onOpenStretchVision={() => {
              closeAllOverlays();
              setShowStretchVision(true);
            }}
            onOpenCalibration={() => {
              closeAllOverlays();
              setShowPostureCalibration(true);
            }}
          />
        )}
        {state.currentTab === 'social' && (
          <SocialScreen
            initialSubTab={socialSubTab}
            onOpenCoworkerProfile={cw => {
              closeAllOverlays();
              setSelectedCoworkerProfile(cw);
            }}
            onOpenInvite={cw => {
              closeAllOverlays();
              setCoworkerToInvite(cw);
            }}
          />
        )}
        {state.currentTab === 'notifications' && (
          <NotificationsScreen
            onClose={() => setCurrentTab('home')}
            onOpenMedals={() => {
              closeAllOverlays();
              setShowGlobalMedals(true);
            }}
            onNavigateToSocialSubTab={subTab => {
              closeAllOverlays();
              setSocialSubTab(subTab);
            }}
          />
        )}
        {state.currentTab === 'menu' && (
          <SettingsModal
            onClose={() => setCurrentTab('home')}
            onEditInterests={() => {
              closeAllOverlays();
              setShowOwnProfile(true);
            }}
            onOpenFacialDetection={() => {
              closeAllOverlays();
              setShowFacialDetection(true);
            }}
          />
        )}

        {/* Settings Modal (Overlay inside main, perfectly aligned with BottomNav with 0 gap) */}
        {showSettingsModal && (
          <SettingsModal
            onClose={closeAllOverlays}
            onEditInterests={() => {
              closeAllOverlays();
              setShowOwnProfile(true);
            }}
            onOpenFacialDetection={() => {
              closeAllOverlays();
              setShowFacialDetection(true);
            }}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (5 tabs) */}
      <BottomNav
        isMenuOpen={isMenuOpen}
        isPopoverActive={isPopoverActive}
        onToggleMenu={() => {
          if (isMenuOpen) {
            setIsMenuOpen(false);
          } else if (isPopoverActive) {
            closeAllOverlays();
          } else {
            setIsMenuOpen(true);
          }
        }}
        onTabSelect={handleSelectTab}
      />

      {/* Menu Popup (Meu Perfil, Meu Avatar, Conquistas, Volta ao mundo, Configurações) */}
      <MenuPopup
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenProfile={() => {
          closeAllOverlays();
          setShowOwnProfile(true);
        }}
        onOpenAvatar={() => {
          closeAllOverlays();
          setShowAvatarModal(true);
        }}
        onOpenMedals={() => {
          closeAllOverlays();
          setShowGlobalMedals(true);
        }}
        onOpenSharedGoal={() => {
          closeAllOverlays();
          setShowSharedGoal(true);
        }}
        onOpenSettings={() => {
          closeAllOverlays();
          setShowSettingsModal(true);
        }}
      />

      {/* Global Modals for Normal Mode */}
      {selectedCoworkerProfile && (
        <CoworkerProfileModal
          coworker={selectedCoworkerProfile}
          onClose={closeAllOverlays}
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
            userAvatarBody={state.user.avatarBody}
            userAvatarFace={state.user.avatarFace}
          onClose={closeAllOverlays}
          onSend={type => {
            createInvitation(coworkerToInvite.id, type);
            setCoworkerToInvite(null);
          }}
        />
      )}

      {showOwnProfile && (
        <CoworkerProfileModal
          isOwnProfile
          onClose={closeAllOverlays}
        />
      )}

      {/* Notifications overlay above everything in normal mode */}
      {showNotifications && (
        <NotificationsScreen
          onClose={() => setShowNotifications(false)}
          onOpenMedals={() => {
            setShowNotifications(false);
            setShowGlobalMedals(true);
          }}
          onNavigateToSocialSubTab={subTab => {
            setShowNotifications(false);
            closeAllOverlays();
            setSocialSubTab(subTab);
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ModalZIndexProvider>
        <DesktopContainer>
          {/* Godmode panel for testers in the top right of the desktop */}
          <DevControls />

          {/* Anchored bottom-right drawer */}
          <DrawerHost>
            <DrawerContent />
          </DrawerHost>
        </DesktopContainer>
      </ModalZIndexProvider>
    </AppProvider>
  );
};

export default App;
