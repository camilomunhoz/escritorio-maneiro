import React from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Bell,
  CheckCheck,
  Gamepad2,
  Users,
  HeartPulse,
  Award,
  Inbox,
  ArrowLeft,
} from 'lucide-react';
import { formatNotificationTime } from '../../../utils/formatters';

interface NotificationsScreenProps {
  onClose?: () => void;
  onOpenMedals?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onClose,
  onOpenMedals,
}) => {
  const { state, markNotificationsRead, markNotificationItemRead, setCurrentTab } = useApp();
  const { notifications } = state;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationItemRead(notif.id);
    if (onClose) {
      onClose();
    }

    // Direct go-to navigation
    if (notif.goToTab) {
      setCurrentTab(notif.goToTab);
    } else if (notif.category === 'games') {
      setCurrentTab('games');
    } else if (notif.category === 'social') {
      setCurrentTab('social');
    } else if (notif.category === 'health') {
      setCurrentTab('health');
    } else if (notif.category === 'medal' && onOpenMedals) {
      onOpenMedals();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'games':
        return <Gamepad2 size={16} className="text-indigo-600" />;
      case 'social':
        return <Users size={16} className="text-sand-700" />;
      case 'health':
        return <HeartPulse size={16} className="text-sage-700" />;
      case 'medal':
        return <Award size={16} className="text-amber-600" />;
      default:
        return <Bell size={16} className="text-calm-600" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* 1. Top Header com botão padrão Fechar */}
      <div className="p-3 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (onClose ? onClose() : setCurrentTab('home'))}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Fechar notificações"
          >
            <ArrowLeft size={15} />
            <span>Fechar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <div className="flex items-center gap-1.5">
            <Bell size={14} className="text-calm-700" />
            <h2 className="text-xs font-semibold text-calm-900">Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
                {unreadCount} novas
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markNotificationsRead}
            className="text-[10px] text-sage-700 hover:text-sage-900 font-medium flex items-center gap-1 cursor-pointer transition"
            title="Marcar todas como lidas"
          >
            <CheckCheck size={12} />
            <span>Marcar lidas</span>
          </button>
        )}
      </div>

      {/* 2. Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-calm-400">
            <Inbox size={32} className="stroke-[1.5] text-calm-300 mb-2" />
            <p className="text-xs font-medium text-calm-600">Nenhuma notificação</p>
            <p className="text-[11px] text-calm-400 mt-0.5">
              Você receberá avisos quando jogos forem liberados ou quando colegas enviarem convites.
            </p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                notif.read
                  ? 'bg-calm-50/50 border-calm-200/70 hover:bg-calm-100/60 hover:border-calm-300'
                  : 'bg-sage-50/70 border-sage-200/90 hover:bg-sage-100/80 hover:border-sage-300 shadow-soft'
              }`}
              title="Clique para ir ao recurso"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.read ? 'bg-calm-100' : 'bg-white shadow-xs'
                }`}
              >
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Não lida" />
                    )}
                    <span
                      className={`text-xs truncate ${
                        notif.read ? 'text-calm-800 font-medium' : 'text-calm-950 font-semibold'
                      }`}
                    >
                      {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-calm-400 shrink-0">
                    {formatNotificationTime(notif.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] text-calm-600 leading-snug">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
