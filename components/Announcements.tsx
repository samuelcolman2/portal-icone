
import React, { useEffect, useState } from 'react';
import type { Announcement } from '../types';
import { MegaphoneIcon, ClockIcon } from './IconComponents';
import { getTimeRemaining } from '../utils/dateHelpers';

interface AnnouncementsProps {
  announcements: Announcement[];
  onViewersClick: (id: string) => void;
  canSeeViews: boolean;
}

const Announcements: React.FC<AnnouncementsProps> = ({
  announcements,
  onViewersClick,
  canSeeViews,
}) => {
  // Forçamos uma re-renderização a cada minuto para atualizar os timers
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
      <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
        <MegaphoneIcon className="mr-3 h-6 w-6 text-blue-600" />
        Comunicados
      </h2>
      {announcements.length ? (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const viewsCount = announcement.views?.length ?? 0;
            const timeRemaining = announcement.createdAt ? getTimeRemaining(announcement.createdAt) : null;

            return (
              <div
                key={announcement.id}
                className="relative space-y-3 border-l-4 border-blue-500 pl-4"
              >
                {/* Timer no canto superior direito */}
                {timeRemaining && (
                  <div className="absolute right-0 top-0 flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <ClockIcon className="h-3 w-3" />
                    {timeRemaining}
                  </div>
                )}

                <div>
                  <h3 className="pr-20 font-semibold text-gray-800 dark:text-gray-200">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {announcement.content}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {`Comunicado feito por ${announcement.author || 'Portal Ícone'} no dia ${announcement.date}`}
                  </p>
                </div>
                {canSeeViews && (
                  <button
                    type="button"
                    onClick={() => onViewersClick(announcement.id)}
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {viewsCount
                      ? `${viewsCount} visualizaç${viewsCount === 1 ? 'ão' : 'ões'}`
                      : 'Nenhuma visualização ainda'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ainda não há comunicados publicados. Use o sino para criar o primeiro!
        </p>
      )}
    </div>
  );
};

export default Announcements;
