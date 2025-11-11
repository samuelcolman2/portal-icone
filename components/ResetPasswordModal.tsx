import React, { useState } from 'react';
import Modal from './Modal';
import { confirmPasswordReset } from '../services/authService';

interface ResetPasswordModalProps {
  onClose: () => void;
  onLoginClick: () => void;
  email: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose, onLoginClick, email }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const successMessage = await confirmPasswordReset({ email, code, newPassword });
      setMessage(successMessage || 'Senha redefinida com sucesso! Você já pode fazer o login.');
      setTimeout(() => {
        onLoginClick(); // Switch to login modal on success
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Falha ao redefinir a senha. Verifique o código e tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Confirmar Redefinição">
      <div className="space-y-4">
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center bg-green-100 dark:bg-green-900/50 p-2 rounded-md">{message}</p>}
        
        {!message && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Um código foi enviado para <strong>{email}</strong>. Por favor, insira o código e sua nova senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código de Verificação</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
             <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
        
        <div className="text-sm text-center">
           <button onClick={onLoginClick} className="font-medium text-blue-600 hover:text-blue-500">Voltar para o Login</button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;