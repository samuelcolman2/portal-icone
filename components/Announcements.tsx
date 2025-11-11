import React from 'react';
import type { Announcement } from '../types';
import { MegaphoneIcon } from './IconComponents';

const announcementsData: Announcement[] = [
  {
    id: 1,
    title: 'Reunião Geral Trimestral',
    content: 'Nossa reunião geral do terceiro trimestre será na próxima sexta-feira. A pauta será enviada por e-mail.',
    date: '15 de Ago, 2024',
  },
  {
    id: 2,
    title: 'Nova Política de Férias',
    content: 'Por favor, revisem a nova política de férias disponível no portal de RH. As mudanças entram em vigor a partir de 1º de setembro.',
    date: '10 de Ago, 2024',
  },
  {
    id: 3,
    title: 'Atualização do Sistema Interno',
    content: 'O sistema de TI passará por uma atualização neste fim de semana. Pode haver instabilidade no acesso no sábado de manhã.',
    date: '5 de Ago, 2024',
  },
];

const Announcements: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <MegaphoneIcon className="w-6 h-6 mr-3 text-blue-600" />
        Anúncios
      </h2>
      <div className="space-y-4">
        {announcementsData.map((announcement) => (
          <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 ">{announcement.title}</h3>
            <p className="text-gray-600 dark:text-gray-400  text-sm">{announcement.content}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500  mt-1">{announcement.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;