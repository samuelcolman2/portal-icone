
export const formatAnnouncementDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const rawMonth = date
    .toLocaleString('pt-BR', { month: 'short' })
    .replace('.', '')
    .trim();
  const month =
    rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).toLowerCase();
  const year = date.getFullYear();
  return `${day} de ${month}, ${year}`;
};

export const formatViewTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'Data desconhecida';
  }
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeRemaining = (createdAt: number): string | null => {
  const EXPIRATION_MS = 48 * 60 * 60 * 1000; // 48 horas em milissegundos
  const expiresAt = createdAt + EXPIRATION_MS;
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h restante${hours !== 1 ? 's' : ''}`;
  }
  return `${minutes}m restante${minutes !== 1 ? 's' : ''}`;
};
