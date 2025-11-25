import React from 'react';
import type { Announcement } from '../types';
import { formatViewTimestamp } from '../utils/dateHelpers';
import { UserCircleIcon } from './IconComponents';

interface AnnouncementViewsModalProps {
  announcement: Announcement;
  onClose: () => void;
}

const AnnouncementViewsModal: React.FC<AnnouncementViewsModalProps> = ({
  announcement,
  onClose,
}) => {
  const views = [...(announcement.views ?? [])].sort(
    (a, b) =>
      new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Quem visualizou
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {announcement.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Fechar modal de visualizações"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
          {views.length ? (
            views.map((view) => (
              <div
                key={`${view.viewerId}-${view.viewedAt}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                {view.photoURL ? (
                  <img
                    src={view.photoURL}
                    alt={view.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {view.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Visualizou em {formatViewTimestamp(view.viewedAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Ninguém visualizou este comunicado ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementViewsModal;
