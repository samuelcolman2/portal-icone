
import React from 'react';
import type { QuickLink } from '../types';
import { LinkIcon } from './IconComponents';

const linksData: QuickLink[] = [
  { id: 1, label: 'Portal de RH', url: '#' },
  { id: 2, label: 'Suporte de TI', url: '#' },
  { id: 3, label: 'Diretório da Empresa', url: '#' },
  { id: 4, label: 'Base de Conhecimento', url: '#' },
];

const QuickLinks: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <LinkIcon className="w-6 h-6 mr-3 text-blue-600" />
        Links Rápidos
      </h2>
      <ul className="space-y-2">
        {linksData.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-700 hover:text-blue-900 hover:underline transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinks;
   