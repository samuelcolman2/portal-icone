import React, { useState } from 'react';
import Modal from './Modal';
import { requestPasswordReset } from '../services/authService';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onLoginClick: () => void;
  onResetRequestSuccess: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onLoginClick, onResetRequestSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('Solicitação enviada! Verifique seu e-mail para o código de redefinição.');
      // After a short delay, trigger the next modal
      setTimeout(() => {
        onResetRequestSuccess(email);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar e-mail. Verifique o endereço e tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Redefinir Senha">
      <div className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center bg-green-100 dark:bg-green-900/50 p-2 rounded-md">{message}</p>}
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
              Digite seu endereço de e-mail e enviaremos um código para redefinir sua senha.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading || !!message}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !!message}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Enviar Código de Redefinição'}
          </button>
        </form>
        
        <div className="text-sm text-center">
           <button onClick={onLoginClick} className="font-medium text-blue-600 hover:text-blue-500">Voltar para o Login</button>
        </div>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;