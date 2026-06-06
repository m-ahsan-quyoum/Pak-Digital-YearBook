import { User, Notification, Message } from '../types';
import { 
  GraduationCap, Home, Search, Users, MessageSquare, CalendarDays, 
  Bell, ShieldAlert, User2, LogOut, Sparkles, Menu, X
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  unreadCount: number;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode?: boolean;
}

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  notifications,
  unreadCount, 
  onLogout,
  isOpen,
  setIsOpen,
  isDarkMode = false
}: SidebarProps) {
  
  const navItems = [
    { id: 'feed', label: 'Memories Feed', icon: Home },
    { id: 'search', label: 'Smart Search', icon: Search },
    { id: 'communities', label: 'University Hubs', icon: Users },
    { id: 'messenger', label: 'Student Chat', icon: MessageSquare },
    { id: 'events', label: 'Campus Scheduler', icon: CalendarDays },
    { id: 'alumni', label: 'Alumni Network', icon: GraduationCap },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    ...(currentUser.role === 'admin' ? [{ id: 'admin', label: 'Admin Terminal', icon: ShieldAlert }] : []),
    { id: 'profile', label: 'Student Portfolio', icon: User2 }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close responsive drawers
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className={`md:hidden sticky top-0 px-4 py-3.5 z-40 flex justify-between items-center w-full border-b transition-all ${
        isDarkMode ? 'bg-[#0a110d]/95 backdrop-blur-md border-[#1a2d22]' : 'bg-white/95 backdrop-blur-md border-[#E8E4E0]'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#E6F0EC] text-[#006644]'
          }`}>
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className={`font-serif italic font-black text-lg tracking-tighter ${
            isDarkMode ? 'text-emerald-400' : 'text-[#006644]'
          }`}>Pak-Yearbook</span>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className={`text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse ${
              isDarkMode ? 'bg-emerald-500 text-slate-950' : 'bg-[#006644] text-white'
            }`}>
              {unreadCount}
            </span>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-[#13231a] text-slate-400' : 'hover:bg-[#F3F1ED] text-neutral-600'
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 p-5 w-72 h-screen z-50 flex flex-col justify-between transition-all duration-300 transform border-r
        md:sticky md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isDarkMode ? 'bg-[#0f1813] border-[#1a2d22]' : 'bg-white border-[#E8E4E0]'}
      `}>
        {/* Brand Header */}
        <div>
          <div className={`flex justify-between items-center mb-8 pb-4 border-b ${
            isDarkMode ? 'border-[#1a2d22]' : 'border-[#E8E4E0]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-md ${
                isDarkMode ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-950/20' : 'bg-[#E6F0EC] text-[#006644] shadow-[#006644]/5'
              }`}>
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className={`font-serif italic font-black text-2xl tracking-tighter ${
                isDarkMode ? 'text-emerald-400' : 'text-[#006644]'
              }`}>
                Pak-Yearbook
              </span>
            </div>
            
            <button className="md:hidden text-slate-500" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer border ${
                    isActive 
                      ? isDarkMode 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner' 
                        : 'bg-[#006644] text-white border-transparent shadow-lg shadow-[#006644]/20'
                      : isDarkMode
                        ? 'text-[#a2b5ac] border-transparent hover:text-slate-200 hover:bg-[#13231a]'
                        : 'text-neutral-700 border-transparent hover:bg-[#F3F1ED] hover:text-[#006644]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-colors ${
                      isActive 
                        ? isDarkMode ? 'text-emerald-400' : 'text-white' 
                        : isDarkMode ? 'text-[#a2b5ac] group-hover:text-slate-200' : 'text-neutral-500 group-hover:text-[#006644]'
                    }`} />
                    <span className="font-sans font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center ${
                      isActive 
                        ? isDarkMode ? 'bg-emerald-500 text-slate-950' : 'bg-white text-[#006644]' 
                        : isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#E6F0EC] text-[#006644]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Profile card */}
        <div>
          {/* User profile capsule card */}
          <div className={`mb-4 p-3 rounded-2xl border flex items-center gap-3 ${
            isDarkMode ? 'bg-[#13231a]/65 border-[#1a2d22]' : 'bg-[#F9F8F6] border-[#E8E4E0]'
          }`}>
            <img 
              src={currentUser.profilePhoto} 
              alt={currentUser.name} 
              className={`w-10 h-10 rounded-full object-cover border ${
                isDarkMode ? 'border-[#1a2d22]' : 'border-[#E8E4E0]'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80';
              }} 
            />
            <div className="min-w-0 flex-1">
              <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A1A]'}`}>{currentUser.name}</h4>
              <p className={`text-[10px] truncate ${isDarkMode ? 'text-[#a2b5ac]' : 'text-neutral-500'}`}>{currentUser.university.replace(/\(.*?\)/, '')}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                  isDarkMode ? 'bg-[#1c3024] text-emerald-400' : 'bg-[#E6F0EC] text-[#006644]'
                }`}>
                  {currentUser.role}
                </span>
                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-[#a2b5ac]' : 'text-neutral-500'}`}>
                  c/o {currentUser.batch}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              isDarkMode 
                ? 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/10' 
                : 'text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100'
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
          
          <div className={`mt-4 pt-3 border-t text-center ${
            isDarkMode ? 'border-[#1a2d22]' : 'border-[#E8E4E0]'
          }`}>
            <span className={`text-[9px] font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-slate-600' : 'text-neutral-400'
            }`}>
              Pakistan Legacy Core v1.1
            </span>
          </div>
        </div>

      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#0a110d]/50 backdrop-blur-sm z-45 md:hidden"
        />
      )}
    </>
  );
}
