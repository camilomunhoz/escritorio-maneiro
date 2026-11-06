import React from 'react';
import { Monitor, Folder, FileSpreadsheet, Globe, Trash2, type LucideIcon } from 'lucide-react';

interface DesktopIconItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'pc', label: 'Este PC', icon: Monitor },
  { id: 'docs', label: 'Documentos', icon: Folder },
  { id: 'sheets', label: 'Planilhas Q3', icon: FileSpreadsheet },
  { id: 'intranet', label: 'Intranet', icon: Globe },
  { id: 'trash', label: 'Lixeira', icon: Trash2 },
];

export const DecorativeDesktopIcons: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 pointer-events-none select-none opacity-40 font-os" aria-hidden="true">
      {DESKTOP_ICONS.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="flex flex-col items-center gap-1 p-2 w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-900/80 border border-blue-500/20 flex items-center justify-center text-sky-300 shadow-sm shadow-blue-950/40">
              <Icon size={20} />
            </div>
            <span className="text-[11px] text-slate-300 font-os font-medium leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

