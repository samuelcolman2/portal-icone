
import React from 'react';
import { AcademicCapIcon } from './IconComponents';

const PedagogicalView: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <AcademicCapIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Setor Pedagógico
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="max-w-sm w-full">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-start space-x-6">
                <div className="bg-blue-500/20 p-4 rounded-2xl flex-shrink-0">
                  <AcademicCapIcon className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                    Portal interno
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Portal de Notas
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Acesse o sistema para lançar VAD, VAO e VAF.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <a
                  href="https://sysgrade.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Acessar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedagogicalView;
