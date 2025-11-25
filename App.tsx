
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Announcements from './components/Announcements';
import AnnouncementsModal from './components/AnnouncementsModal';
import AnnouncementViewsModal from './components/AnnouncementViewsModal';
import TeamDirectory from './components/TeamDirectory';
import GeminiAssistant from './components/GeminiAssistant';
import Home from './components/Home';
import RhView from './components/RhView';
import PedagogicalView from './components/PedagogicalView';
import NativosView from './components/NativosView';

import ComprasView from './components/ComprasView';
import TecnologiaView from './components/TecnologiaView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import EditProfileModal from './components/EditProfileModal';
import BirthdayModal from './components/BirthdayModal';
import type { Announcement, CustomUser, SignUpData } from './types';
import { logout as logoutService, signUp as signUpService } from './services/authService';
import { ensureUserProfileDocument, listenToUserAccess } from './services/userProfileService';
import { formatAnnouncementDate } from './utils/dateHelpers';
import { createAnnouncement, listenToAnnouncements, addAnnouncementView } from './services/announcementService';

type ModalType =
  | 'login'
  | 'signup'
  | 'forgotPassword'
  | 'resetPassword'
  | 'editProfile'
  | 'birthday'
  | 'announcements'
  | null;

const ANNOUNCEMENTS_STORAGE_KEY = 'portalAnnouncements';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const [currentUser, setCurrentUser] = useState<CustomUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  const [signUpData, setSignUpData] = useState<Omit<SignUpData, 'birthday'> | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementViewsId, setAnnouncementViewsId] = useState<string | null>(null);
  const [hasOpenedNotifications, setHasOpenedNotifications] = useState(false);
  const viewerId = currentUser?.email ?? null;
  const viewerName = currentUser?.displayName ?? currentUser?.email ?? 'Visitante';
  const viewerPhoto = currentUser?.photoURL ?? null;

  useEffect(() => {
    const unsubscribe = listenToAnnouncements((data) => {
      setAnnouncements(data);
    });
    return () => unsubscribe();
  }, []);

  const markAnnouncementsViewed = useCallback(() => {
    if (!viewerId) return;
    announcements.forEach((announcement) => {
      const views = announcement.views ?? [];
      if (!views.some((view) => view.viewerId === viewerId)) {
        addAnnouncementView(announcement.id, {
          viewerId,
          name: viewerName,
          photoURL: viewerPhoto,
          viewedAt: new Date().toISOString(),
        });
      }
    });
  }, [announcements, viewerId, viewerName, viewerPhoto]);

  const handleLoginSuccess = (user: CustomUser) => {
    setCurrentUser(user);
    // Persist user session in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    closeModal();
  };

  const handleProfileUpdate = (updatedUser: CustomUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsed: CustomUser = JSON.parse(storedUser);
          const enriched = await ensureUserProfileDocument(parsed);
          if (enriched.isActive === false || enriched.role === 'pendente') {
            await logoutService();
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            if (enriched.role === 'pendente') {
              alert('Seu cadastro ainda está pendente de aprovação. Aguarde um administrador liberar o acesso.');
            }
            return;
          }
          setCurrentUser(enriched);
          localStorage.setItem('currentUser', JSON.stringify(enriched));
        }
      } catch (error) {
        console.error("Failed to hydrate stored user", error);
        localStorage.removeItem('currentUser');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setHasOpenedNotifications(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeModal === 'announcements' && hasOpenedNotifications && currentUser) {
      markAnnouncementsViewed();
    }
  }, [activeModal, hasOpenedNotifications, currentUser, markAnnouncementsViewed]);

  useEffect(() => {
    if (announcementViewsId === null) return;
    const exists = announcements.some((item) => item.id === announcementViewsId);
    if (!exists) {
      setAnnouncementViewsId(null);
    }
  }, [announcements, announcementViewsId]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = useCallback(
    async (reason?: string) => {
      await logoutService();
      setCurrentUser(null);
      setHasOpenedNotifications(false);
      setActiveView('Home');
      if (reason) {
        alert(reason);
      }
    },
    []
  );

  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = listenToUserAccess(currentUser.email, ({ hasAccess, reason }) => {
      if (!hasAccess) {
        const message =
          reason === 'pending'
            ? 'Seu cadastro está pendente de aprovação. Aguarde até que um administrador libere o acesso.'
            : 'Seu acesso foi revogado.';
        handleLogout(message);
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [currentUser?.email, handleLogout]);

  const openModal = (modal: ModalType) => {
    setSignUpError(null);
    setActiveModal(modal);
  }
  const closeModal = () => {
    setActiveModal(null);
    setResetEmail(null);
    setSignUpData(null);
    setSignUpError(null);
    setIsSigningUp(false);
  };

  const handleResetRequestSuccess = (email: string) => {
    setResetEmail(email);
    openModal('resetPassword');
  };

  const handleSignUpDetails = (details: Omit<SignUpData, 'birthday'>) => {
    setSignUpData(details);
    setActiveModal('birthday');
  };

  const handleSaveBirthdayAndSignUp = async (birthday: string) => {
    if (!signUpData) return;

    setIsSigningUp(true);
    setSignUpError(null);

    try {
      const finalSignUpData: SignUpData = { ...signUpData, birthday };
      const newUser = await signUpService(finalSignUpData);
      if (newUser.role === 'pendente') {
        closeModal();
        alert('Cadastro enviado! Aguarde um administrador aprovar seu acesso.');
        return;
      }
      handleLoginSuccess(newUser);
    } catch (err: any) {
      setSignUpError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setIsSigningUp(false);
    }
  };

  // ... (rest of the component)

  const handleCreateAnnouncement = async ({ title, content }: { title: string; content: string }) => {
    const author = currentUser?.displayName || currentUser?.email || 'Portal Ícone';
    const authorPhotoURL = currentUser?.photoURL || null;
    try {
      await createAnnouncement(title, content, author, authorPhotoURL);
    } catch (error) {
      console.error("Failed to create announcement", error);
      alert("Erro ao criar comunicado. Tente novamente.");
    }
  };

  const handleNotificationsClick = () => {
    if (!currentUser) return;
    setHasOpenedNotifications(true);
    openModal('announcements');
  };

  const handleOpenAnnouncementViews = (id: string) => {
    if (!currentUser || !hasOpenedNotifications) return;
    setAnnouncementViewsId(id);
  };

  const handleCloseAnnouncementViews = () => {
    setAnnouncementViewsId(null);
  };

  const announcementForViews = useMemo(() => {
    if (announcementViewsId === null) return null;
    return announcements.find((item) => item.id === announcementViewsId) ?? null;
  }, [announcementViewsId, announcements]);

  const canSeeViewCounts = Boolean(currentUser && hasOpenedNotifications);


  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="loader"></div> {/* Add a proper loader/spinner here */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-gray-800 bg-gray-50 dark:bg-slate-900 dark:text-gray-200">
      <Sidebar
        activeItem={activeView}
        setActiveItem={setActiveView}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLoginClick={() => openModal('login')}
        onLogoutClick={handleLogout}
        onEditProfileClick={() => openModal('editProfile')}
        onNotificationsClick={handleNotificationsClick}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeView === 'Home' ? (
          <Home currentUser={currentUser} />
        ) : activeView === 'Admin' ? (
          <AdminView currentUser={currentUser} />
        ) : activeView === 'RH' ? (
          <RhView />

        ) : activeView === 'Compras' ? (
          <ComprasView />
        ) : activeView === 'Pedagógico' ? (
          <PedagogicalView />
        ) : activeView === 'Nativos' ? (
          <NativosView />
        ) : activeView === 'Tecnologia e Inovação' ? (
          <TecnologiaView />
        ) : (
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <GeminiAssistant />
                </div>

                <Announcements
                  announcements={announcements}
                  onViewersClick={handleOpenAnnouncementViews}
                  canSeeViews={canSeeViewCounts}
                />
                <TeamDirectory />

              </div>
            </div>
          </div>
        )}
      </main>

      {activeModal === 'login' && (
        <LoginModal
          onClose={closeModal}
          onLoginSuccess={handleLoginSuccess}
          onSignUpClick={() => openModal('signup')}
          onForgotPasswordClick={() => openModal('forgotPassword')}
        />
      )}
      {activeModal === 'signup' && (
        <SignUpModal
          onClose={closeModal}
          onSignUpDetails={handleSignUpDetails}
          onLoginClick={() => openModal('login')}
        />
      )}
      {activeModal === 'announcements' && (
        <AnnouncementsModal
          announcements={announcements}
          onCreateAnnouncement={handleCreateAnnouncement}
          authorName={currentUser?.displayName || currentUser?.email || 'Portal Ícone'}
          authorPhotoURL={currentUser?.photoURL}
          canSeeViews={canSeeViewCounts}
          onViewersClick={handleOpenAnnouncementViews}
          onClose={closeModal}
          userRole={currentUser?.role}
        />
      )}
      {activeModal === 'birthday' && (
        <BirthdayModal
          onClose={closeModal}
          onSave={handleSaveBirthdayAndSignUp}
          isLoading={isSigningUp}
          error={signUpError}
        />
      )}
      {canSeeViewCounts && announcementForViews && (
        <AnnouncementViewsModal
          announcement={announcementForViews}
          onClose={handleCloseAnnouncementViews}
        />
      )}
      {activeModal === 'forgotPassword' && (
        <ForgotPasswordModal
          onClose={closeModal}
          onLoginClick={() => openModal('login')}
          onResetRequestSuccess={handleResetRequestSuccess}
        />
      )}
      {activeModal === 'resetPassword' && resetEmail && (
        <ResetPasswordModal
          onClose={closeModal}
          onLoginClick={() => openModal('login')}
          email={resetEmail}
        />
      )}
      {activeModal === 'editProfile' && currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={closeModal}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

    </div>
  );
};

export default App;
