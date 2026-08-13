import React from 'react';
import { AppLanguage, ThemeColor } from '../types';
import { themeConfigs } from '../lib/theme';
import { getTranslation } from '../lib/translations';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Trophy,
  UserCheck
} from 'lucide-react';

export type NavTab = 'dashboard' | 'students' | 'homework' | 'rating' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: AppLanguage;
  theme: ThemeColor;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  lang,
  theme,
}) => {
  const activeTheme = themeConfigs[theme] || themeConfigs['forest_green'];

  const items: { id: NavTab; labelKey: any; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'students', labelKey: 'students', icon: Users },
    { id: 'homework', labelKey: 'homework', icon: BookOpen },
    { id: 'rating', labelKey: 'ratingAndReports', icon: Trophy },
    { id: 'profile', labelKey: 'profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-stone-200/80 dark:border-zinc-800 px-2 py-2 shadow-xl">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const label = getTranslation(lang, item.labelKey);

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-h-[48px] min-w-[56px] ${
                isActive
                  ? 'text-white font-bold scale-105 shadow-md'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              style={{
                backgroundColor: isActive ? activeTheme.primary : 'transparent',
              }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
