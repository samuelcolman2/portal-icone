
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Announcement, CustomUser } from '../types';
import { listenToUsers } from '../services/userProfileService';
import { formatAnnouncementDate, getTimeRemaining } from '../utils/dateHelpers';
import { BellIcon, MegaphoneIcon, UserCircleIcon, ClockIcon } from './IconComponents';

type TabOption = 'announcements' | 'birthdays';

type BirthdayPerson = {
  id: string;
  name: string;
  day: number;
  dayLabel: string;
  photoURL?: string | null;
};

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

const layoutSlots = [
  { top: '24%', left: '25%' },
  { top: '24%', left: '75%' },
  { top: '50%', left: '50%' },
  { top: '76%', left: '25%' },
  { top: '76%', left: '75%' },
] as const;

const borderPalette = ['#FBC02D', '#FB8C00', '#4FC3F7', '#E0E0E0', '#BDBDBD'];

const formatMonthLabel = (date: Date) => {
  const base = monthFormatter.format(date);
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const parseBirthday = (value?: string) => {
  if (!value) return null;
  const [yearStr, monthStr, dayStr] = value.split('-');
  if (!monthStr || !dayStr) return null;
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  return {
    month,
    day,
    label: `${day.toString().padStart(2, '0')}/${(month + 1)
      .toString()
      .padStart(2, '0')}`,
  };
};

const computeDynamicSlot = (index: number, total: number) => {
  if (!total) {
    return { top: '50%', left: '50%' };
  }
  const safeIndex = index - layoutSlots.length;
  const remainder = Math.max(total - layoutSlots.length, 1);
  const angle = (safeIndex / remainder) * Math.PI * 2;
  const radius = 25;
  const top = 50 + Math.sin(angle) * radius;
  const left = 50 + Math.cos(angle) * radius;
  return {
    top: `${top}%`,
    left: `${left}%`,
  };
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};

interface CreateAnnouncementModalProps {
  onClose: () => void;
  onSave: (values: { title: string; content: string }) => void;
  authorName: string;
  authorPhotoURL?: string | null;
}

const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  onClose,
  onSave,
  authorName,
  authorPhotoURL,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const previewTitle = title.trim() || 'Título do comunicado';
  const previewContent =
    content.trim() || 'Digite o comunicado para ver a pré-visualização aqui.';
  const previewDate = formatAnnouncementDate(new Date());
  const previewAuthor = authorName || 'Portal Ícone';
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
    });
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6 transition-opacity"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl scale-100 overflow-hidden rounded-3xl bg-white dark:bg-[#111D34] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B1324] px-8 py-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Novo Comunicado
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Preencha as informações para compartilhar com a equipe.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-8 px-8 py-8 lg:grid-cols-2">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Título do Comunicado
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Ex: Reunião geral de novembro"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1F2A40] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Conteúdo
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={600}
                placeholder="Descreva os detalhes do comunicado aqui..."
                rows={8}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1F2A40] px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className={`flex-1 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-500/30 ${
                  isValid ? 'hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'
                }`}
              >
                Publicar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 dark:border-white/10 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </form>

          <div className="flex flex-col">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">
              Pré-visualização
            </p>
            <div className="flex-1 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0B1324] p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <MegaphoneIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {previewTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    {previewContent}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                     {authorPhotoURL ? (
                        <img src={authorPhotoURL} className="h-5 w-5 rounded-full object-cover" alt={previewAuthor} />
                     ) : (
                        <span className="font-medium text-gray-600 dark:text-slate-400">
                          {previewAuthor}
                        </span>
                     )}
                    <span>•</span>
                    <span>{previewDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnnouncementsModalProps {
  onClose: () => void;
  announcements: Announcement[];
  onCreateAnnouncement: (values: { title: string; content: string }) => void;
  authorName: string;
  authorPhotoURL?: string | null;
  onViewersClick: (id: string) => void;
  canSeeViews: boolean;
  userRole?: string;
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  onClose,
  announcements,
  onCreateAnnouncement,
  authorName,
  authorPhotoURL,
  onViewersClick,
  canSeeViews,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<TabOption>('announcements');
  const [users, setUsers] = useState<CustomUser[]>([]);
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(false);
  const hasLoadedBirthdaysRef = useRef(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Para atualizar o timer a cada minuto
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== 'birthdays') {
      return;
    }
    let cancelled = false;
    if (!hasLoadedBirthdaysRef.current) {
      setIsLoadingBirthdays(true);
    }
    const unsubscribe = listenToUsers((payload) => {
      if (cancelled) return;
      hasLoadedBirthdaysRef.current = true;
      setUsers(payload);
      setIsLoadingBirthdays(false);
    });
    return () => {
      cancelled = true;
      unsubscribe && unsubscribe();
    };
  }, [activeTab]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const birthdaysThisMonth = useMemo(() => {
    return users
      .map<BirthdayPerson | null>((user) => {
        const parsed = parseBirthday(user.birthday);
        if (!parsed || parsed.month !== currentMonth) {
          return null;
        }
        return {
          id: user.email || `${user.displayName}-${parsed.day}`,
          name: user.displayName || user.email || 'Colaborador',
          day: parsed.day,
          dayLabel: parsed.label,
          photoURL: user.photoURL,
        };
      })
      .filter((item): item is BirthdayPerson => Boolean(item))
      .sort((a, b) => a.day - b.day);
  }, [users, currentMonth]);

  const renderAnnouncementsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas Atualizações</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Fique por dentro de tudo que acontece no Colégio Ícone</p>
             </div>
             {userRole === 'admin' && (
               <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:scale-105 active:scale-95"
              >
                <span className="text-lg leading-none">+</span>
                Novo Comunicado
              </button>
             )}
        </div>

        <div className="space-y-4">
          {announcements.length ? (
            announcements.map((announcement) => {
              const viewsCount = announcement.views?.length ?? 0;
              const timeRemaining = announcement.createdAt ? getTimeRemaining(announcement.createdAt) : null;

              return (
                <div
                  key={announcement.id}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111D34] p-6 shadow-xl transition-all hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#15223D]"
                >
                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                             <BellIcon className="h-5 w-5" />
                        </div>
                        <div>
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {announcement.title}
                             </h3>
                             <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                                {announcement.content}
                             </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-[#0B1324] px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/5">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {announcement.date}
                            </span>
                        </div>
                         {/* Timer no modal */}
                        {timeRemaining && (
                            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 border border-orange-500/20">
                                <ClockIcon className="h-3.5 w-3.5" />
                                {timeRemaining}
                            </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4 pl-11">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-500">
                         {announcement.author ? (
                            <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-[#0B1324] px-2 py-1 pr-3 border border-gray-200 dark:border-white/5">
                                {announcement.authorPhotoURL ? (
                                    <img
                                        src={announcement.authorPhotoURL}
                                        alt={announcement.author}
                                        className="h-5 w-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                                       {announcement.author.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-gray-700 dark:text-slate-300">{announcement.author}</span>
                            </div>
                         ) : (
                            <span>Portal Ícone</span>
                         )}
                      </div>

                      {canSeeViews && (
                        <button
                          type="button"
                          onClick={() => onViewersClick(announcement.id)}
                          className="group/viewers flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                        >
                          <span className="group-hover/viewers:underline">
                            {viewsCount} visualizaç{viewsCount === 1 ? 'ão' : 'ões'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#111D34]/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1F2A40]">
                <MegaphoneIcon className="h-8 w-8 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="mt-4 font-medium text-gray-600 dark:text-slate-300">
                Nenhum comunicado publicado.
              </p>
              {userRole === 'admin' ? (
                <p className="text-sm text-gray-500 dark:text-slate-500">
                    Clique em "Novo Comunicado" para começar.
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-500">
                    Fique atento, novidades em breve.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBirthdaysTab = () => {
    if (isLoadingBirthdays) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 dark:border-slate-600 border-t-orange-500" />
          <p className="mt-4 text-sm font-medium">Carregando aniversariantes...</p>
        </div>
      );
    }

    if (!birthdaysThisMonth.length) {
      return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#111D34] py-20 text-center">
          <div className="text-4xl mb-4">🎂</div>
          <p className="font-medium text-gray-600 dark:text-slate-300">
            Nenhum aniversariante em {formatMonthLabel(today)}.
          </p>
        </div>
      );
    }

    const monthLabel = formatMonthLabel(today);

    return (
      <div className="overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111D34] shadow-xl">
        <div className="aniversaries-font-inter relative mx-auto w-full max-w-4xl overflow-hidden bg-white dark:bg-[#0B1324]">
          {/* Birthday Header */}
          <header className="relative bg-orange-600 px-8 py-10 text-center shadow-orange-900/20">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                Celebrações de
              </p>
              <p className="aniversaries-font-cursive mt-2 text-5xl text-white drop-shadow-lg sm:text-6xl">
                {monthLabel}
              </p>
            </div>
            
            <div className="absolute top-6 right-8 rotate-12 text-4xl opacity-30 text-white mix-blend-overlay">🎈</div>
            <div className="absolute top-16 right-24 -rotate-12 text-3xl opacity-30 text-white mix-blend-overlay">🎉</div>
          </header>

          {/* Orbit Layout */}
          <div className="relative h-[600px] w-full bg-white dark:bg-[#0B1324] sm:h-[700px]">
            {/* Orbits */}
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200 dark:border-white/5" />
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200 dark:border-white/5" />
            
            {/* Center Logo */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-sm">
                 <img
                    src="https://iconecolegioecurso.com.br/wp-content/uploads/2022/08/xlogo_icone_site.png.pagespeed.ic_.QgXP3GszLC.webp"
                    alt="Logo"
                    className="w-32 grayscale"
                 />
             </div>

            {birthdaysThisMonth.map((person, index) => {
              const slot =
                index < layoutSlots.length
                  ? layoutSlots[index]
                  : computeDynamicSlot(index, birthdaysThisMonth.length);
              const borderColor = borderPalette[index % borderPalette.length];

              return (
                <div
                  key={person.id}
                  className="absolute flex w-[140px] flex-col items-center text-center transition-transform hover:z-10 hover:scale-110 sm:w-[160px]"
                  style={{
                    top: slot.top,
                    left: slot.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative mb-3 group">
                    <div className="absolute -inset-1 rounded-full bg-gray-100 dark:bg-white/5 blur-md transition group-hover:bg-gray-200 dark:group-hover:bg-white/10" />
                    {person.photoURL ? (
                      <img
                        src={person.photoURL}
                        alt={`Foto de ${person.name}`}
                        className="relative h-20 w-20 rounded-full border-[3px] object-cover shadow-2xl sm:h-24 sm:w-24"
                        style={{ borderColor }}
                      />
                    ) : (
                      <div
                        className="relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] text-xl font-bold text-white shadow-2xl sm:h-24 sm:w-24 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-[#1F2A40] dark:to-[#111D34]"
                        style={{
                          borderColor,
                        }}
                      >
                        {getInitials(person.name)}
                      </div>
                    )}
                    <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-bold text-white shadow-lg ring-1 ring-black/20"
                        style={{ backgroundColor: borderColor }}
                    >
                      {person.dayLabel}
                    </div>
                  </div>
                  <div className="w-full px-2">
                    <p className="truncate text-sm font-medium text-gray-700 dark:text-slate-200 sm:text-base">
                      {person.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/90 backdrop-blur-sm px-4 py-6 transition-opacity"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#0B1324] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0B1324] px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1F2A40] text-orange-500 shadow-inner">
                <BellIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Central de Comunicados
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Acompanhe as novidades e avisos importantes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
              aria-label="Fechar modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0B1324] px-8">
            {(['announcements', 'birthdays'] as TabOption[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative mr-8 py-4 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-orange-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'announcements' ? 'Comunicados' : 'Aniversariantes'}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0B1324] p-4 sm:p-8 custom-scrollbar">
            {activeTab === 'announcements'
              ? renderAnnouncementsTab()
              : renderBirthdaysTab()}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateAnnouncementModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={onCreateAnnouncement}
          authorName={authorName}
          authorPhotoURL={authorPhotoURL}
        />
      )}
    </>
  );
};

export default AnnouncementsModal;
