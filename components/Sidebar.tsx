import React, { useEffect, useRef, useState } from 'react';
import {
  AcademicCapIcon,
  BellIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChipIcon,
  Cog6ToothIcon,
  HomeIcon,
  LogoutIcon,
  MoonIcon,
  ProductsIcon,
  ShieldCheckIcon,
  SunIcon,
  UserCircleIcon,
  UsersIcon,
} from './IconComponents';
import type { CustomUser } from '../types';

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  theme: string;
  toggleTheme: () => void;
  currentUser: CustomUser | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onEditProfileClick: () => void;
}

const menuItems = [
  { label: 'Home', icon: HomeIcon, view: 'Home' },
  {
    label: 'Tecnologia e Inovação',
    icon: ChipIcon,
    view: 'Tecnologia e Inovação',
  },
  { label: 'RH', icon: UsersIcon, view: 'RH' },
  { label: 'Financeiro', icon: ChartBarIcon, view: 'Financeiro' },
  { label: 'Pedagógico', icon: AcademicCapIcon, view: 'Pedagógico' },
  { label: 'Nativos', icon: ProductsIcon, view: 'Nativos' },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  setActiveItem,
  isCollapsed,
  toggleSidebar,
  theme,
  toggleTheme,
  currentUser,
  onLoginClick,
  onLogoutClick,
  onEditProfileClick,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserName = () => {
    if (!currentUser) {
      return 'Usuario';
    }
    return currentUser.displayName || currentUser.email || 'Usuario';
  };

  const handleLogout = () => {
    onLogoutClick();
    setIsSettingsOpen(false);
  };

  return (
    <aside
      className={`relative ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden md:flex flex-col flex-shrink-0 border-r border-gray-200 bg-white p-4 text-slate-600 transition-all duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-slate-500 shadow dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300"
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5" />
        )}
      </button>

      <div className="mb-8 flex items-center justify-between px-2">
        <div
          className={`flex items-center ${
            isCollapsed ? 'w-full justify-center' : ''
          }`}
        >
          <img
            src="https://storage.googleapis.com/ecdt-logo-saida/a73fc637322495f3f7b01b605cd08ed04de92a0064a63bf7ab8c77c23388db0a/ICONE-COLEGIO-E-CURSO.webp"
            alt="Ícone Colégio e Curso"
            className="h-8 w-auto flex-shrink-0"
          />
          <span
            className={`ml-3 overflow-hidden text-lg font-bold text-slate-800 transition-all duration-200 dark:text-slate-100 ${
              isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
            }`}
          >
            PORTAL ÍCONE
          </span>
        </div>
        {!isCollapsed && (
          <button
            className="rounded-full p-1 text-slate-500 transition hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Notificações"
          >
            <BellIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.view} className="mb-2">
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveItem(item.view);
                }}
                className={`flex items-center rounded-lg p-3 text-sm font-medium transition ${
                  activeItem === item.view
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span
                  className={`ml-4 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                    isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        {currentUser ? (
          <button
            onClick={onEditProfileClick}
            className={`mb-4 flex w-full items-center rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-slate-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Foto do perfil"
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 flex-shrink-0 text-slate-400 dark:text-slate-500" />
            )}
            <div
              className={`ml-3 overflow-hidden text-left transition-all duration-200 ${
                isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
              }`}
            >
              <p
                className="truncate text-sm font-medium text-slate-800 dark:text-slate-100"
                title={getUserName()}
              >
                {getUserName()}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Editar perfil</span>
                {currentUser.role && (
                  <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {currentUser.role}
                  </span>
                )}
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className={`mb-4 flex w-full items-center rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-slate-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <UserCircleIcon className="h-10 w-10 flex-shrink-0 text-slate-400 dark:text-slate-500" />
            <span
              className={`ml-3 text-sm font-medium text-slate-800 dark:text-slate-100 ${
                isCollapsed ? 'hidden' : ''
              }`}
            >
              Login
            </span>
          </button>
        )}

        <ul className="space-y-2">
          <li>
            <button
              onClick={toggleTheme}
              className={`flex w-full items-center rounded-lg p-3 transition hover:bg-gray-100 dark:hover:bg-slate-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Alterar tema' : undefined}
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6 flex-shrink-0" />
              ) : (
                <SunIcon className="h-6 w-6 flex-shrink-0" />
              )}
              <span
                className={`ml-4 text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
                }`}
              >
                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              </span>
            </button>
          </li>

          {currentUser && (
            <li ref={settingsRef} className="relative">
              <button
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className={`flex w-full items-center rounded-lg p-3 transition hover:bg-gray-100 dark:hover:bg-slate-700 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Configurações' : undefined}
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
              >
                <Cog6ToothIcon className="h-6 w-6 flex-shrink-0" />
                <span
                  className={`ml-4 text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
                  }`}
                >
                  Configurações
                </span>
              </button>

              {isSettingsOpen && (
                <div
                  className={`absolute bottom-full z-20 mb-3 w-[18rem] rounded-2xl border border-gray-200 bg-white p-3 text-sm shadow-2xl transition dark:border-slate-600 dark:bg-slate-800 ${
                    isCollapsed ? 'right-0' : 'left-0'
                  }`}
                  role="menu"
                >
                  <ul className="space-y-1">
                    {currentUser.role === 'admin' && (
                      <li>
                        <button
                          onClick={() => {
                            setActiveItem('Admin');
                            setIsSettingsOpen(false);
                          }}
                          className="flex w-full items-center rounded-lg px-2 py-2 text-left text-slate-700 transition hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          <ShieldCheckIcon className="h-5 w-5 flex-shrink-0" />
                          <span className="ml-3 text-sm font-medium">
                            Admin
                          </span>
                        </button>
                      </li>
                    )}
                    <li>
                      <button
                        className="flex w-full items-center rounded-lg px-2 py-2 text-left text-slate-700 transition hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                        role="menuitem"
                      >
                        <BellIcon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-3 text-sm font-medium">
                          Notificações
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-lg px-2 py-2 text-left font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        role="menuitem"
                      >
                        <LogoutIcon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-3 text-sm">Sair</span>
                      </button>
                    </li>
                  </ul>

                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
