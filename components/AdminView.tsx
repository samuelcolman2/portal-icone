import React, { useEffect, useState } from 'react';
import type { CustomUser } from '../types';
import {
  listenToUsers,
  updateUserAccess,
} from '../services/userProfileService';
import { ShieldCheckIcon, UserCircleIcon } from './IconComponents';

interface AdminViewProps {
  currentUser: CustomUser | null;
}

const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<CustomUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      return;
    }
    const unsubscribe = listenToUsers((payload) => {
      setUsers(payload);
      setIsLoading(false);
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [isAdmin]);

  const handleToggle = async (user: CustomUser) => {
    if (!user.email) return;
    setError(null);
    const isActive = user.isActive !== false;
    setUpdatingEmail(user.email);
    try {
      await updateUserAccess(user.email, !isActive);
    } catch (err: any) {
      setError(
        err?.message || 'Não foi possível atualizar o acesso no momento.',
      );
    } finally {
      setUpdatingEmail(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-900 px-4 py-10 text-center text-white">
        <ShieldCheckIcon className="h-16 w-16 text-orange-400" />
        <div>
          <p className="text-2xl font-semibold">Acesso restrito</p>
          <p className="mt-2 text-sm text-slate-300">
            Você precisa de permissões administrativas para visualizar esta
            página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-[#0B1324] px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="text-center sm:text-left">
          <p className="text-3xl font-black text-[#F55225] sm:text-[2.75rem]">
            Painel do Administrador
          </p>
          <p className="mt-2 text-base text-slate-300">
            Gerencie o acesso de todos os usuários do sistema.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111D34] shadow-2xl">
          <div className="grid grid-cols-[minmax(0,2fr)_auto] bg-[#16213A] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            <span>Usuário</span>
            <span className="text-right">Acesso</span>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="px-6 py-10 text-sm text-slate-400">
              Carregando usuários...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-400">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <ul>
              {users.map((user, index) => {
                const isActive = user.isActive !== false;
                const disabled = user.email === currentUser?.email;
                const isLast = index === users.length - 1;

                return (
                  <li
                    key={user.email}
                    className={`flex items-center justify-between px-6 py-4 text-sm ${
                      isLast ? '' : 'border-b border-white/10'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          className="h-10 w-10 rounded-full object-cover"
                          alt={user.displayName || user.email}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2A40] text-slate-400">
                          <UserCircleIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                          {user.displayName || user.email}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(user)}
                      disabled={disabled || updatingEmail === user.email}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
                        isActive ? 'bg-[#FF7600]' : 'bg-slate-500/60'
                      } ${
                        disabled || updatingEmail === user.email
                          ? 'opacity-60'
                          : ''
                      }`}
                      aria-label={`Alternar acesso para ${user.email}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
