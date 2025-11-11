import React from 'react';
import { ExternalLinkIcon, ProductsIcon } from './IconComponents';

const kpis = [
  {
    name: 'Sponte',
    url: 'https://www.sponteeducacional.net.br/',
    favicon: 'https://www.sponteeducacional.net.br/favicon.png',
    bgColor: 'bg-purple-500/10',
    shadowColor: 'shadow-purple-500/20',
    hoverColor: 'hover:bg-purple-600',
    buttonColor: 'bg-purple-500',
  },
  {
    name: 'COC',
    url: 'https://jornada.coc.com.br',
    favicon: 'https://cdn-icons-png.flaticon.com/512/2702/2702111.png',
    bgColor: 'bg-green-500/10',
    shadowColor: 'shadow-green-500/20',
    hoverColor: 'hover:bg-green-600',
    buttonColor: 'bg-green-500',
  },
  {
    name: 'ClassAPP',
    url: 'https://www.classapp.com.br/',
    favicon: 'https://cdn.prod.website-files.com/5cf6646fb1bedb1cac953e0c/5d4b1190c03a647ade4f1fa4_favicon-classapp.png',
    bgColor: 'bg-cyan-500/10',
    shadowColor: 'shadow-cyan-500/20',
    hoverColor: 'hover:bg-cyan-600',
    buttonColor: 'bg-cyan-500',
  },
];

const NativosView: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <ProductsIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Aplicativos Nativos
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {kpis.map((kpi) => (
            <div key={kpi.name} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className={`${kpi.bgColor} p-3 rounded-2xl flex-shrink-0 flex items-center justify-center w-12 h-12`}>
                  <img src={kpi.favicon} alt={`${kpi.name} logo`} className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {kpi.name}
                  </h2>
                </div>
              </div>
              <div className="mt-6 flex-grow flex items-end">
                <a
                  href={kpi.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center text-center w-full ${kpi.buttonColor} text-white font-semibold py-3 px-6 rounded-xl ${kpi.hoverColor} transition-all duration-300 shadow-lg ${kpi.shadowColor}`}
                >
                  Acessar <ExternalLinkIcon className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NativosView;