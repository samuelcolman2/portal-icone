import React, { useState, useMemo } from 'react';
import Modal from './Modal';

interface BirthdayModalProps {
  onSave: (birthday: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const BirthdayModal: React.FC<BirthdayModalProps> = ({ onSave, onClose, isLoading, error }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const yearOptions = [];
    for (let i = currentYear - 16; i >= startYear; i--) {
      yearOptions.push(i);
    }
    return yearOptions;
  }, []);

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];
  
  const daysInMonth = useMemo(() => {
      if (!year || !month) return 31;
      return new Date(parseInt(year), parseInt(month), 0).getDate();
  }, [year, month]);

  const days = useMemo(() => {
    const dayOptions = [];
    for (let i = 1; i <= daysInMonth; i++) {
        dayOptions.push(i < 10 ? `0${i}` : `${i}`);
    }
    return dayOptions;
  }, [daysInMonth]);

  const isValidDate = day && month && year && !isNaN(new Date(`${year}-${month}-${day}`).getTime());

  const handleSave = async () => {
    if (!isValidDate) return;
    await onSave(`${year}-${month}-${day}`);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Quando é o seu aniversário?" isClosable={false}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Esta informação é necessária para concluir seu cadastro.
        </p>
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Dia</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mês</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Mês</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ano</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Ano</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!isValidDate || isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Aniversário'}
        </button>
      </div>
    </Modal>
  );
};

export default BirthdayModal;
