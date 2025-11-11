import React, { useState, useRef, useEffect } from 'react';
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

  const menuItems = [
    { name: 'Home', icon: HomeIcon, action: () => setActiveItem('Home') },
    { name: 'Tecnologia e Inovação', icon: ChipIcon, action: () => setActiveItem('Tecnologia e Inovação') },
    { name: 'RH', icon: UsersIcon, action: () => setActiveItem('RH') },
    { name: 'Financeiro', icon: ChartBarIcon, action: () => setActiveItem('Financeiro') },
    { name: 'Pedagógico', icon: AcademicCapIcon, action: () => setActiveItem('Pedagógico') },
    { name: 'Nativos', icon: ProductsIcon, action: () => setActiveItem('Nativos') },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserName = () => {
    if (!currentUser) return '';
    return currentUser.displayName || currentUser.email || 'Usuário';
  };

  return (
    <aside className={`relative ${isCollapsed ? 'w-20' : 'w-64'} bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex-col flex-shrink-0 p-4 hidden md:flex border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out`}>
      
      <button 
        onClick={toggleSidebar} 
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-7 h-7 bg-gray-100 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none z-10 transition-colors"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
      </button>

      {/* Header */}
       <div className={`flex items-center justify-between mb-8 px-2`}>
        <div className={`flex items-center ${isCollapsed ? 'w-full justify-center' : ''}`}>
          <img 
              src="https://storage.googleapis.com/ecdt-logo-saida/a73fc637322495f3f7b01b605cd08ed04de92a0064a63bf7ab8c77c23388db0a/ICONE-COLEGIO-E-CURSO.webp" 
              alt="Ícone Colégio e Curso Logo"
              className="h-8 w-auto flex-shrink-0"
          />
          <span className={`font-bold text-slate-800 dark:text-slate-100 text-lg ml-3 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100' } transition-all duration-200`}>PORTAL ÍCONE</span>
        </div>
        {!isCollapsed && (
          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Notificações">
            <BellIcon className="w-6 h-6" />
          </button>
        )}
      </div>


      {/* Navigation */}
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  item.action();
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  activeItem === item.name
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className={`font-medium ml-4 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100' } transition-all duration-200`}>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        {currentUser ? (
           <button onClick={onEditProfileClick} className={`w-full flex items-center p-2 mb-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
             {currentUser.photoURL ? (
               <img src={currentUser.photoURL} alt="Foto do Perfil" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
             ) : (
               <UserCircleIcon className="h-10 w-10 text-slate-400 dark:text-slate-500 flex-shrink-0" />
             )}
             <div className={`ml-3 overflow-hidden text-left ${isCollapsed ? 'w-0' : ''} transition-all duration-200`}>
               <p className="font-medium text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap truncate" title={getUserName()}>
                 {getUserName()}
               </p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Editar Perfil</p>
             </div>
           </button>
        ) : (
          <button onClick={onLoginClick} className={`w-full flex items-center p-2 mb-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
            <UserCircleIcon className="h-10 w-10 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <div className={`ml-3 overflow-hidden ${isCollapsed ? 'w-0' : ''} transition-all duration-200`}>
              <p className="font-medium text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">Login</p>
            </div>
          </button>
        )}

        <ul className="space-y-2">
            <li>
                <button onClick={toggleTheme} className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? 'Alterar tema' : ''}>
                {theme === 'light' ? <MoonIcon className="w-6 h-6 flex-shrink-0" /> : <SunIcon className="w-6 h-6 flex-shrink-0" />}
                <span className={`font-medium text-sm ml-4 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100' } transition-all duration-200`}>
                    {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                </span>
                </button>
            </li>
            {currentUser && (
                <li className="relative" ref={settingsRef}>
                    <button 
                        onClick={() => setIsSettingsOpen(prev => !prev)} 
                        className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`} 
                        title={isCollapsed ? 'Configurações' : ''}
                        aria-haspopup="true"
                        aria-expanded={isSettingsOpen}
                    >
                        <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
                        <span className={`font-medium text-sm ml-4 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100' } transition-all duration-200`}>
                        Configurações
                        </span>
                    </button>
                    {isSettingsOpen && (
                        <div 
                            className={`absolute bottom-full mb-2 p-2 rounded-lg shadow-lg border bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 z-20 transition-opacity duration-200
                            ${isCollapsed ? 'left-full ml-2 w-48' : 'left-0 w-full'}`}
                            role="menu"
                        >
                            <ul className="space-y-1">
                                <li>
                                    <button className={`w-full text-left flex items-center p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200`} role="menuitem">
                                        <BellIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className={`font-medium text-sm ml-3`}>Notificações</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => { onLogoutClick(); setIsSettingsOpen(false); }} className={`w-full text-left flex items-center p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200`} role="menuitem">
                                        <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className={`font-medium text-sm ml-3`}>Sair</span>
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