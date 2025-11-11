
import React, { useState } from 'react';
import AppLauncher from './AppLauncher';
import { SearchIcon } from './IconComponents';

const Home: React.FC = () => {
    const [query, setQuery] = useState('');
    const logoUrl = 'https://iconecolegioecurso.com.br/wp-content/uploads/2022/08/xlogo_icone_site.png.pagespeed.ic_.QgXP3GszLC.webp';

    return (
        <div className="flex flex-col h-full flex-1">
            <header className="flex justify-end items-center p-4 sm:p-6">
                <div className="flex items-center space-x-4 text-sm">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-200 hover:underline">Gmail</a>
                    <a href="https://www.google.com/imghp" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-200 hover:underline">Imagens</a>
                    <AppLauncher />
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center pb-20 px-4">
                <img 
                    className="h-24 w-auto mb-8" 
                    src={logoUrl} 
                    alt="Ícone Logo" 
                />
                
                <form 
                    action="https://www.google.com/search" 
                    method="GET" 
                    target="_blank" 
                    className="w-full sm:max-w-xl md:max-w-2xl"
                >
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="search"
                            name="q"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquisar no Google ou digitar um URL"
                            className="w-full p-4 pl-12 text-gray-900 bg-white dark:bg-slate-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            required
                        />
                    </div>
                    <div className="flex justify-center mt-6 space-x-4">
                        <button type="submit" className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                            Pesquisa Google
                        </button>
                        <button type="submit" name="btnI" value="1" className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                            Estou com sorte
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Home;