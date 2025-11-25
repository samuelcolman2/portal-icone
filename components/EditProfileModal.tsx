import React, { useState, useRef, useMemo } from 'react';
import Modal from './Modal';
import { updateProfile } from '../services/authService';
import type { CustomUser, UpdateProfileData } from '../types';
import { CameraIcon, UserCircleIcon } from './IconComponents';

interface EditProfileModalProps {
  currentUser: CustomUser;
  onClose: () => void;
  onProfileUpdate: (updatedUser: CustomUser) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [cpf, setCpf] = useState(currentUser.cpf || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser.photoURL || null);
  const [photoFile, setPhotoFile] = useState<string | null>(null);

  const initialBirthday = currentUser.birthday ? currentUser.birthday.split('-') : ['', '', ''];
  const [year, setYear] = useState(initialBirthday[0]);
  const [month, setMonth] = useState(initialBirthday[1]);
  const [day, setDay] = useState(initialBirthday[2]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
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


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value.toUpperCase());
  };
  
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // 1MB in bytes for base64 string length
        while (dataUrl.length > 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        if (dataUrl.length > 1024 * 1024) {
          setError("A imagem é muito grande, mesmo após a compressão. Tente uma imagem menor.");
          return;
        }

        setPhotoPreview(dataUrl);
        setPhotoFile(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
      setError("O CPF deve conter 11 dígitos.");
      return;
    }

    const birthdayString = (year && month && day) ? `${year}-${month}-${day}` : null;
    if (birthdayString && isNaN(new Date(birthdayString).getTime())) {
        setError("Data de aniversário inválida.");
        return;
    }

    setIsLoading(true);

    const updateData: UpdateProfileData = {
      email: currentUser.email,
    };
    
    // Only add fields if they have changed
    if (displayName !== (currentUser.displayName || '')) {
        updateData.displayName = displayName;
    }
    if (photoFile) {
        updateData.photoURL = photoFile;
    }
    if (cpf !== (currentUser.cpf || '')) {
        updateData.cpf = cpf;
    }
    if (birthdayString !== (currentUser.birthday || null)) {
        updateData.birthday = birthdayString ?? undefined;
    }

    // If no changes were made
    if (Object.keys(updateData).length <= 1 && !photoFile) {
        setError("Nenhuma alteração foi feita.");
        setIsLoading(false);
        return;
    }

    try {
      const updatedUser = await updateProfile(updateData);
      onProfileUpdate(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center bg-green-100 dark:bg-green-900/50 p-2 rounded-md">{success}</p>}
        
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Prévia do perfil" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full border-2 border-white dark:border-slate-800"
              aria-label="Mudar foto do perfil"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
          <input
            type="text"
            value={displayName}
            onChange={handleNameChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm uppercase placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
            <div className="grid grid-cols-3 gap-4 mt-1">
                <div>
                    <select value={day} onChange={(e) => setDay(e.target.value)}  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Dia</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <select value={month} onChange={(e) => setMonth(e.target.value)}  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Mês</option>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                <div>
                    <select value={year} onChange={(e) => setYear(e.target.value)}  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Ano</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;