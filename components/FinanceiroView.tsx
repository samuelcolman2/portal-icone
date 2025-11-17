import React from 'react';
import { ShoppingCartIcon } from './IconComponents';

const FinanceiroView: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-sm w-full">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-start space-x-6">
            <div className="bg-teal-500/20 p-4 rounded-2xl flex-shrink-0">
                <ShoppingCartIcon className="w-8 h-8 text-teal-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Compras
              </h2>
            </div>
          </div>
          <div className="mt-8">
            <a
              href="https://iconeshop.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-teal-600 transition-all duration-300 shadow-lg shadow-teal-500/20"
            >
              Acessar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroView;
