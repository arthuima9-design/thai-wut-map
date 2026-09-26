import React from 'react';
import { Home, Map as MapIcon, Bell, MapPin } from 'lucide-react';

export type MobileTab = 'home' | 'map' | 'alerts' | 'myarea';

interface BottomNavProps {
  currentTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  alertCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  alertCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe shadow-lg">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {/* Tab: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'home' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px]">หน้าแรก</span>
        </button>

        {/* Tab: Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'map' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapIcon className="w-5 h-5 mb-1" />
          <span className="text-[10px]">แผนที่</span>
        </button>

        {/* Tab: Alerts */}
        <button
          onClick={() => onTabChange('alerts')}
          className={`relative flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'alerts' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5 mb-1" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold bg-rose-500 text-white rounded-full">
                {alertCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">แจ้งเตือน</span>
        </button>

        {/* Tab: My Area */}
        <button
          onClick={() => onTabChange('myarea')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'myarea' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-5 h-5 mb-1" />
          <span className="text-[10px]">พื้นที่ฉัน</span>
        </button>
      </div>
    </nav>
  );
};
