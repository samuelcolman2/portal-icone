import React from 'react';
import type { TeamMember } from '../types';
import { UsersIcon } from './IconComponents';

const teamData: TeamMember[] = [
  { id: 1, name: 'Ana Silva', role: 'Gerente de Marketing', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
  { id: 2, name: 'Bruno Costa', role: 'Desenvolvedor Sênior', avatarUrl: 'https://picsum.photos/id/1005/100/100' },
  { id: 3, name: 'Carla Dias', role: 'Analista de RH', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
  { id: 4, name: 'Diego Martins', role: 'Designer UI/UX', avatarUrl: 'https://picsum.photos/id/1012/100/100' },
];

const TeamDirectory: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <UsersIcon className="w-6 h-6 mr-3 text-blue-600" />
        Equipe
      </h2>
      <div className="space-y-4">
        {teamData.map((member) => (
          <div key={member.id} className="flex items-center space-x-4">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={member.avatarUrl}
              alt={member.name}
            />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200 ">{member.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 ">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamDirectory;