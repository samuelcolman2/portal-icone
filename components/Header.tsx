import React from 'react';
import AppLauncher from './AppLauncher';

const Header: React.FC = () => {
  const logoUrl = 'https://iconecolegioecurso.com.br/wp-content/uploads/2022/08/xlogo_icone_site.png.pagespeed.ic_.QgXP3GszLC.webp';

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
            <img 
              className="h-14 w-auto" 
              src={logoUrl} 
              alt="Ícone Logo" 
            />
            <div className="flex items-center space-x-6">
                <a href="#" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Webmail</a>
                <a href="#" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Documentos</a>
                <AppLauncher />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;