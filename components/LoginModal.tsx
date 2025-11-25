import React, { useState } from 'react';
import Modal from './Modal';
import { signIn } from '../services/authService';
import type { CustomUser } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
  onLoginSuccess: (user: CustomUser) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSignUpClick, onForgotPasswordClick, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await signIn({ email, password });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Entrar na sua conta">
      <div className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar com Email'}
          </button>
        </form>
       
        <div className="text-sm text-center">
          <button onClick={onForgotPasswordClick} className="font-medium text-blue-600 hover:text-blue-500">Esqueceu sua senha?</button>
        </div>
         <div className="text-sm text-center">
            Não tem uma conta? <button onClick={onSignUpClick} className="font-medium text-blue-600 hover:text-blue-500">Cadastre-se</button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;