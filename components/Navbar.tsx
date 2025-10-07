import React from 'react';
import { AppView } from '../types';

interface NavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

interface NavItemProps {
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
  isVertical?: boolean;
}

const icons = {
    JOURNAL: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    INSIGHTS: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707" /></svg>,
    SETTINGS: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};
const navItems = [
  { label: 'Journal', view: 'JOURNAL' as AppView, icon: icons.JOURNAL },
  { label: 'Insights', view: 'INSIGHTS' as AppView, icon: icons.INSIGHTS },
  { label: 'Settings', view: 'SETTINGS' as AppView, icon: icons.SETTINGS },
];

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick, isVertical = false }) => {
  const baseClasses = `flex items-center justify-center transition-colors duration-200`;
  const activeClasses = 'text-primary';
  const inactiveClasses = 'text-secondary hover:text-primary';
  const layoutClasses = isVertical
    ? 'flex-row justify-start w-full p-3 rounded-lg'
    : 'flex-col w-full pt-3 pb-2';
  const activeBg = isVertical && isActive ? 'bg-amber-100' : '';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${layoutClasses} ${activeBg}`}
      aria-label={label}
    >
      {icon}
      <span className={isVertical ? "ml-3" : "text-xs mt-1"}>{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<NavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm border-t border-amber-200 md:hidden">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(item => (
            <NavItem 
                key={item.view}
                label={item.label} 
                icon={item.icon} 
                isActive={currentView === item.view} 
                onClick={() => setView(item.view)} 
            />
        ))}
      </div>
    </nav>
  );
};

export const SideNav: React.FC<NavProps> = ({ currentView, setView }) => {
    return (
        <nav className="hidden md:block w-56 p-4 border-r border-amber-200 flex-shrink-0">
             <div className="text-xl font-bold text-primary mb-8">Dotly.ai</div>
             <div className="space-y-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.view}
                        label={item.label} 
                        icon={item.icon} 
                        isActive={currentView === item.view} 
                        onClick={() => setView(item.view)}
                        isVertical={true}
                    />
                ))}
            </div>
        </nav>
    )
}
