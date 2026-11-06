export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffMin < 1) {
    return 'Agora mesmo';
  }
  if (diffMin < 60) {
    return `Há ${diffMin} min`;
  }
  if (diffHour < 24) {
    return `Há ${diffHour} h`;
  }
  if (diffDays === 1) {
    return 'Ontem';
  }
  if (diffDays < 30) {
    return `Há ${diffDays} dias`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? 'Há 1 mês' : `Há ${diffMonths} meses`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? 'Há 1 ano' : `Há ${diffYears} anos`;
}

// SSOT: Mantém compatibilidade total com notificações
export const formatNotificationTime = formatRelativeTime;
