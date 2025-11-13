import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Announcements from './components/Announcements';
import TeamDirectory from './components/TeamDirectory';
import GeminiAssistant from './components/GeminiAssistant';
import Home from './components/Home';
import RhView from './components/RhView';
import PedagogicalView from './components/PedagogicalView';
import NativosView from './components/NativosView';
import FinanceiroView from './components/FinanceiroView';
import TecnologiaView from './components/TecnologiaView';
import AdminView from './components/AdminView';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import EditProfileModal from './components/EditProfileModal';
import BirthdayModal from './components/BirthdayModal';
import type { CustomUser, SignUpData } from './types';
import { logout as logoutService, signUp as signUpService } from './services/authService';
import { ensureUserProfileDocument, listenToUserAccess } from './services/userProfileService';

type ModalType = 'login' | 'signup' | 'forgotPassword' | 'resetPassword' | 'editProfile' | 'birthday' | null;

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
          if (enriched.isActive === false) {
            await logoutService();
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
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
      setActiveView('Home');
      if (reason) {
        alert(reason);
      }
    },
    []
  );

  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = listenToUserAccess(currentUser.email, (isActive) => {
      if (!isActive) {
        handleLogout('Seu acesso foi revogado.');
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
      handleLoginSuccess(newUser);
    } catch (err: any) {
      setSignUpError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setIsSigningUp(false);
    }
  };


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
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeView === 'Home' ? (
          <Home currentUser={currentUser} />
        ) : activeView === 'Admin' ? (
          <AdminView currentUser={currentUser} />
        ) : activeView === 'RH' ? (
          <RhView />
        ) : activeView === 'Financeiro' ? (
          <FinanceiroView />
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

                <Announcements />
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
       {activeModal === 'birthday' && (
        <BirthdayModal
          onClose={closeModal}
          onSave={handleSaveBirthdayAndSignUp}
          isLoading={isSigningUp}
          error={signUpError}
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
