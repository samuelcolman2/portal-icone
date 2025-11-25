import React, { useState, useRef, useEffect } from 'react';
import { 
  GridIcon,
  GmailIcon, 
  GoogleDriveIcon, 
  GoogleDocsIcon,
  GoogleSheetsIcon,
  GoogleCalendarIcon,
  YouTubeIcon,
  GoogleKeepIcon
} from './IconComponents';

interface App {
  id: number;
  name: string;
  url: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const appsData: App[] = [
  { id: 1, name: 'Gmail', url: '#', icon: GmailIcon },
  { id: 2, name: 'Drive', url: '#', icon: GoogleDriveIcon },
  { id: 3, name: 'Docs', url: '#', icon: GoogleDocsIcon },
  { id: 4, name: 'Sheets', url: '#', icon: GoogleSheetsIcon },
  { id: 5, name: 'Calendário', url: '#', icon: GoogleCalendarIcon },
  { id: 6, name: 'YouTube', url: '#', icon: YouTubeIcon },
  { id: 7, name: 'Keep', url: '#', icon: GoogleKeepIcon },
];

const AppLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Aplicativos Ícone"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <GridIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50"
          role="menu"
        >
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {appsData.map(app => (
                <a
                  key={app.id}
                  href={app.url}
                  className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                  role="menuitem"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <app.icon className="w-10 h-10" />
                  </div>
                  <span className="text-xs text-center text-gray-800 dark:text-gray-200 ">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLauncher;