
import React from 'react';
import { ChipIcon } from './IconComponents';

const TecnologiaView: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <ChipIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Departamento de Tecnologia e Inovação
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="max-w-sm w-full">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-start space-x-6">
                <div className="bg-yellow-500/20 p-4 rounded-2xl flex-shrink-0">
                  <ChipIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-yellow-500 font-semibold">
                    Suporte Técnico
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Abertura de Chamados
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Abra um chamado.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <a
                  href="https://helpdeskicone.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-yellow-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-yellow-600 transition-all duration-300 shadow-lg shadow-yellow-500/20"
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

export default TecnologiaView;
